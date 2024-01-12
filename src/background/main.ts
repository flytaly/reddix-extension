import { onMessage, sendMessage } from 'webext-bridge/background'
import { savePosts } from '~/logic/db/queries'
import { getPosts, onRateLimits } from '~/reddit'
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

async function fetchItems(username: string) {
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
    const [listing, errMsg] = await getPosts(username, onRateLimitsWrap, after)
    if (errMsg) {
      console.error(errMsg)
      setStateAndNotify({ fetchError: errMsg })
      break
    }
    if (!listing) {
      break
    }

    const savedNew = await savePosts(listing)
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

async function startFetching(username: string) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '', loaded: 0, savedNew: 0 })
  await fetchItems(username)
  setStateAndNotify({ isFetching: false })
}

onMessage('fetch-saved', async (msg) => {
  void startFetching(msg.data.username)
  return state
})

onMessage('get-state', async () => {
  return state
})
