import { liveQuery } from 'dexie'
import { reactive } from 'vue'

import { db } from './db/index'
import type { BgState } from '~/background/bg-state'
import { onMessage, sendMessage } from '~/messages'

export const state = reactive<BgState>({
  isFetching: false,
  fetchError: '',
  loaded: 0,
  savedNew: 0,
})

export async function setupMessageHandlers() {
  sendMessage('get-state', null) //
    .then((updated) => {
      Object.assign(state, updated)
    })

  onMessage('state-update', ({ data }) => {
    Object.assign(state, data)
  })
}

interface Info {
  tags: Record<string, number>
  total: number
}

export const stats = reactive<Info>({
  tags: {},
  total: 0,
})

export function getTagsArray() {
  return Object.entries(stats.tags)
}

export async function setupStatsStore() {
  const tagsObs = liveQuery(async () => {
    const tags = await db.redditItems.orderBy('_tags').keys((keys) => {
      const count = {} as Record<string, number>
      keys.forEach((key) => {
        const k = key.toString()
        count[k] = (count[k] || 0) + 1
      })
      return count
    })
    const total = await db.redditItems.count()
    return [tags, total] as const
  })

  return tagsObs.subscribe((response) => {
    stats.tags = response[0]
    stats.total = response[1]
  })
}
