import { reactive } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge/options'
import type { SearchQuery } from './db/queries'

export const state = reactive({
  isFetching: false,
  fetchError: '',
})

export async function initiateMessageHandlers() {
  sendMessage('get-state', null) //
    .then((state) => {
      Object.assign(state, state)
    })

  onMessage('state-update', ({ data }) => {
    Object.assign(state, data)
  })
}

void initiateMessageHandlers()

export const search = reactive<SearchQuery>({
  query: '',
  hidePosts: false,
  hideComments: false,
})
