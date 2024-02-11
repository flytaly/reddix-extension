import { onMessage, sendMessage } from 'webext-bridge/background'
import { savePosts } from '~/logic/db/mutations'
import { fetchRedditItems, onRateLimits } from '~/reddit'
import devSetup from './dev-setup'
import { state, type BgState } from './bg-state'
import { RateLimits } from '~/reddit/rate-limits'
import { waitRateLimits } from '~/logic/wait-limits'

devSetup()

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

function setStateAndNotify(updates: Partial<BgState>) {
  Object.assign(state, updates)
  sendMessage('state-update', state, { context: 'options', tabId: -1 })
}

async function fetchItems(username: string, category: ItemCategory) {
  let rateLimits: RateLimits | undefined
  let after: string = ''

  const onRateLimitsWrap = (rl: RateLimits) => {
    rl = onRateLimits(rl)
    rateLimits = rl
    return rl
  }
  let end = false
  while (!end) {
    end = true
    const [listing, errMsg] = await fetchRedditItems({ username, category, after }, onRateLimitsWrap)
    if (errMsg) {
      console.error(errMsg)
      setStateAndNotify({ fetchError: errMsg })
      break
    }
    if (!listing) {
      break
    }

    const savedNew = await savePosts(listing, category)
    setStateAndNotify({
      loaded: state.loaded + listing.data.children.length,
      savedNew: state.savedNew + (savedNew || 0),
    })

    const nextAfter = listing.data.after
    end = !nextAfter || nextAfter === after || listing.data.children.length < 100
    after = nextAfter || ''

    await waitRateLimits(rateLimits, console.log)
  }
}

async function startFetching(username: string, category: ItemCategory) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '', loaded: 0, savedNew: 0 })
  await fetchItems(username, category)
  setStateAndNotify({ isFetching: false })
}

onMessage('fetch-items', async (msg) => {
  void startFetching(msg.data.username, msg.data.category)
  return state
})

onMessage('get-state', async () => {
  return state
})
