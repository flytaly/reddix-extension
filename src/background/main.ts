import { onMessage, sendMessage } from 'webext-bridge/background'
import { savePosts } from '~/logic/db/mutations'
import { fetchRedditItems, onRateLimits } from '~/reddit'
import devSetup from './dev-setup'
import { state, type BgState } from './bg-state'
import { RateLimits } from '~/reddit/rate-limits'
import { waitRateLimits } from '~/logic/wait-limits'
import { reqInfoStorage } from '~/logic/browser-storage'

devSetup()

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

function setStateAndNotify(updates: Partial<BgState>) {
  Object.assign(state, updates)
  sendMessage('state-update', state, { context: 'options', tabId: -1 })
}

function getLastId(category: ItemCategory) {
  if (category === 'saved') {
    return reqInfoStorage.value.lastSavedItemId
  } else if (category === 'upvoted') {
    return reqInfoStorage.value.lastUpvotedItemId
  }
}

function setLastId(category: ItemCategory, id: string) {
  if (category === 'saved') {
    reqInfoStorage.value.lastSavedItemId = id
  } else if (category === 'upvoted') {
    reqInfoStorage.value.lastUpvotedItemId = id
  }
}

function setFetchDate(category: ItemCategory) {
  if (category === 'saved') {
    reqInfoStorage.value.lastSavedItemFetchTime = Date.now()
  } else if (category === 'upvoted') {
    reqInfoStorage.value.lastUpvotedItemFetchTime = Date.now()
  }
}

async function fetchItems(username: string, category: ItemCategory, fetchAll = false) {
  let rateLimits: RateLimits | undefined
  let after: string = ''

  const stopAtId = fetchAll ? null : getLastId(category)

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

    if (!after) setLastId(category, listing.data.children[0].data.name)

    const nextAfter = listing.data.after
    end = !nextAfter || nextAfter === after || listing.data.children.length < 100
    after = nextAfter || ''

    if (stopAtId && !end) {
      end = listing.data.children.findIndex((it) => it.data.name === stopAtId) !== -1
    }

    await waitRateLimits(rateLimits, console.log)
  }
  setFetchDate(category)
}

async function startFetching(username: string, category: ItemCategory, fetchAll = false) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '', loaded: 0, savedNew: 0 })
  await fetchItems(username, category, fetchAll)
  setStateAndNotify({ isFetching: false })
}

onMessage('fetch-items', async (msg) => {
  void startFetching(msg.data.username, msg.data.category, msg.data.options?.fetchAll)
  return state
})

onMessage('get-state', async () => {
  return state
})
