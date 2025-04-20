import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import type { SearchQuery } from '~/logic/db/queries'
import { defaultOptions } from '~/logic/extension-options'
import type { RateLimits } from '~/reddit/rate-limits'

type StorageKey = 'inputs' | 'requestInfo' | 'options'

export const optionsStorage = useWebExtensionStorage('options' as StorageKey, defaultOptions)

const memoInputsDefault = {
  username: '',
  categories: ['saved', 'upvoted'] as ItemCategory[],
  itemTypes: ['post', 'comment'] as ItemType[],
  currentView: 'list' as ViewType,
  sortDirection: 'desc' as SearchDirection,
  sortBy: 'id' as SearchQuery['sortBy'],
}

export const inputsStorage = useWebExtensionStorage('inputs' as StorageKey, memoInputsDefault)

export const userName = computed({
  get() {
    return inputsStorage.value.username
  },
  set(value) {
    inputsStorage.value.username = value.trim()
  },
})

export interface RequestInfo {
  rateLimits: RateLimits
  lastSavedItemId?: string
  lastUpvotedItemId?: string
  lastSavedItemFetchTime?: number
  lastUpvotedItemFetchTime?: number
  timestamp?: number
}

export const reqInfoStorage = useWebExtensionStorage<RequestInfo>('requestInfo' as StorageKey, {
  rateLimits: {},
  lastSavedItemId: '',
  lastUpvotedItemId: '',
  lastSavedItemFetchTime: 0,
  lastUpvotedItemFetchTime: 0,
  timestamp: 0,
})

export async function setupStorage() {
  try {
    await browser.storage.local.get()
  }
  catch (error) {
    console.error('Error while accessing storage.', error)
  }
}
