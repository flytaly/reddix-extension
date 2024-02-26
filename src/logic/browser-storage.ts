import { assignSerialized, useStorage } from '~/composables/useStorage'
import { RateLimits } from '~/reddit/rate-limits'
import { defaultOptions } from './extension-options'
import { type SearchQuery } from '~/logic/db/queries'

type StorageKey = 'inputs' | 'requestInfo' | 'options'

export const optionsStorage = useStorage('options', defaultOptions)

const memoInputsDefault = {
  username: '',
  categories: ['saved', 'upvoted'] as ItemCategory[],
  itemTypes: ['post', 'comment'] as ItemType[],
  currentView: 'list' as ViewType,
  sortDirection: 'desc' as SearchDirection,
  sortBy: 'created' as SearchQuery['sortBy'],
}

export const inputsStorage = useStorage('inputs', memoInputsDefault)

export const userName = computed({
  get() {
    return inputsStorage.username
  },
  set(value) {
    inputsStorage.username = value.trim()
  },
})

export type RequestInfo = {
  rateLimits: RateLimits
  lastSavedItemId?: string
  lastUpvotedItemId?: string
  lastSavedItemFetchTime?: number
  lastUpvotedItemFetchTime?: number
  timestamp?: number
}

export const reqInfoStorage = useStorage<RequestInfo>('requestInfo', {
  rateLimits: {},
  lastSavedItemId: '',
  lastUpvotedItemId: '',
  lastSavedItemFetchTime: 0,
  lastUpvotedItemFetchTime: 0,
  timestamp: 0,
})

export async function setupStorage() {
  try {
    const { options, inputs, requestInfo } = (await browser.storage.local.get()) as Record<StorageKey, string>
    if (options) assignSerialized(optionsStorage, options)
    if (inputs) assignSerialized(inputsStorage, inputs)
    if (requestInfo) assignSerialized(reqInfoStorage, requestInfo)
  } catch (error) {
    console.error('Error while accessing storage.', error)
  }
}
