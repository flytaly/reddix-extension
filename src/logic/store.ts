import { reactive } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge/options'
import type { SearchQuery } from './db/queries'
import { db } from './db/index'
import { liveQuery } from 'dexie'

export const state = reactive({
  isFetching: false,
  fetchError: '',
})

export async function setupMessageHandlers() {
  sendMessage('get-state', null) //
    .then((state) => {
      Object.assign(state, state)
    })

  onMessage('state-update', ({ data }) => {
    Object.assign(state, data)
  })
}

void setupMessageHandlers()

export const search = reactive<SearchQuery>({
  query: '',
  hidePosts: false,
  hideComments: false,
})

type Info = {
  tags: Record<string, number>
}

export const stats = reactive<Info>({ tags: {} })

export const getTagsArray = () => {
  return Object.entries(stats.tags)
}

export async function setupStatsStore() {
  const tagsObs = liveQuery(() =>
    db.savedItems.orderBy('_tags').keys((keys) => {
      const count = {} as Record<string, number>
      keys.forEach((key) => {
        const k = key.toString()
        count[k] = (count[k] || 0) + 1
      })
      return count
    }),
  )

  return tagsObs.subscribe((response) => {
    stats.tags = response
  })
}
