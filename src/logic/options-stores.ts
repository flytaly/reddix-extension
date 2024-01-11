import { reactive } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge/options'
import { db } from './db/index'
import { liveQuery } from 'dexie'
import type { BgState } from '~/background/bg-state'

export const state = reactive<BgState>({
  isFetching: false,
  fetchError: '',
  loaded: 0,
  savedNew: 0,
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

setupMessageHandlers()

type Info = {
  tags: Record<string, number>
  total: number
}

export const stats = reactive<Info>({
  tags: {},
  total: 0,
})

export const getTagsArray = () => {
  return Object.entries(stats.tags)
}

export async function setupStatsStore() {
  const tagsObs = liveQuery(async () => {
    const tags = await db.savedItems.orderBy('_tags').keys((keys) => {
      const count = {} as Record<string, number>
      keys.forEach((key) => {
        const k = key.toString()
        count[k] = (count[k] || 0) + 1
      })
      return count
    })
    const total = await db.savedItems.count()
    return [tags, total] as const
  })

  return tagsObs.subscribe((response) => {
    stats.tags = response[0]
    stats.total = response[1]
  })
}
