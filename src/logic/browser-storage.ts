import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { RateLimits } from '~/reddit/rate-limits'
import { ExtensionOptions, defaultOptions } from './extension-options'

export const optionsStorage = useWebExtensionStorage<ExtensionOptions>('options', defaultOptions, {
  mergeDefaults: true,
})

const memoInputs = {
  username: '',
  categories: ['saved', 'upvoted'] as ItemCategory[],
  itemTypes: ['post', 'comment'] as ItemType[],
  currentView: 'list' as ViewType,
  sortDirection: 'asc' as SearchDirection,
}

export const memo = useWebExtensionStorage('memo', memoInputs)

export const userName = computed({
  get() {
    return memo.value.username
  },
  set(value) {
    memo.value.username = value.trim()
  },
})

type RequestInfo = {
  rateLimits: RateLimits
  timestamp: number
  lastSavedItemId?: string
  lastUpvotedItemId?: string
  lastSavedItemFetchTime?: number
  lastUpvotedItemFetchTime?: number
}

const reqInfoStorage = useWebExtensionStorage<RequestInfo>('request-info', {
  rateLimits: {},
  timestamp: 0,
})

export const requestInfo = computed({
  get() {
    return reqInfoStorage.value
  },
  set(values: Partial<RequestInfo>) {
    reqInfoStorage.value = { ...reqInfoStorage.value, ...values }
  },
})
