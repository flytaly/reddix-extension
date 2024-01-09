import { onMessage, sendMessage } from 'webext-bridge/background'
import { requestInfo } from '~/logic'
import { upsertItems } from '~/logic/db/queries'
import { getPosts } from '~/reddit'
import { RateLimits } from '~/reddit/rate-limits'
import type { RedditItem, RedditItemResponse } from '~/reddit/reddit-types'
import devSetup from './dev-setup'

devSetup()

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

export type BgState = {
  isFetching: boolean
  fetchError: string | null
}

const state: BgState = {
  isFetching: false,
  fetchError: '',
}

function setStateAndNotify(updates: Partial<BgState>) {
  Object.assign(state, updates)
  sendMessage('state-update', state, { context: 'options', tabId: -1 })
}

async function savePosts(listing: RedditItemResponse) {
  if (!listing?.data) {
    return
  }

  try {
    const items = listing.data.children.map((itm) => itm.data) as RedditItem[]
    await upsertItems(items)
  } catch (error) {
    console.error(error)
  }
}

function onRateLimits(rl: RateLimits) {
  requestInfo.value = { rateLimits: rl }
}

async function fetchPosts(username: string) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '' })

  const [listing, errMsg] = await getPosts(username, onRateLimits)
  if (errMsg) {
    console.error(errMsg)
  }

  if (listing) {
    await savePosts(listing)
  }
  setStateAndNotify({ isFetching: false, fetchError: errMsg })
}

onMessage('fetch-saved', async (msg) => {
  void fetchPosts(msg.data.username)
  return state
})

onMessage('get-state', async () => {
  return state
})
