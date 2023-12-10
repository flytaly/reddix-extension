import { onMessage, sendMessage } from 'webext-bridge/background'
import devSetup from './dev-setup'
import { getPosts } from '~/reddit'

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

async function fetchPosts(username: string) {
  if (state.isFetching) {
    return
  }
  setStateAndNotify({ isFetching: true, fetchError: '' })
  const [_, errMsg] = await getPosts(username)
  if (errMsg) {
    console.error(errMsg)
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
