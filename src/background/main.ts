import { onMessage, sendMessage } from 'webext-bridge/background'
import devSetup from './dev-setup'
import { getPosts } from '~/reddit'
import type { RedditItem, RedditItemResponse } from '~/reddit/reddit-types'
import { type SavedRedditItem, db } from '~/db'

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
    await db.savedItems.bulkAdd(items as SavedRedditItem[])
  } catch (error) {
    console.error(error)
  }
}

async function fetchPosts(username: string) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '' })
  const [listing, errMsg] = await getPosts(username)
  if (errMsg) {
    console.error(errMsg)
  }

  setStateAndNotify({ isFetching: false, fetchError: errMsg })

  if (listing) {
    await savePosts(listing)
  }
}

onMessage('fetch-saved', async (msg) => {
  void fetchPosts(msg.data.username)
  return state
})

onMessage('get-state', async () => {
  return state
})
