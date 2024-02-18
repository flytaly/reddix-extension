import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { RateLimits } from '~/reddit/rate-limits'
import { ExtensionOptions, defaultOptions } from './extension-options'
import { throttleFilter } from '@vueuse/core'

export const optionsStorage = useWebExtensionStorage<ExtensionOptions>('options', defaultOptions, {
  mergeDefaults: true,
  eventFilter: throttleFilter(200),
})

const memoInputs = {
  username: '',
  categories: ['saved', 'upvoted'] as ItemCategory[],
  itemTypes: ['post', 'comment'] as ItemType[],
  currentView: 'list' as ViewType,
  sortDirection: 'asc' as SearchDirection,
}

export const memo = useWebExtensionStorage('memo', memoInputs, { eventFilter: throttleFilter(100) })

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
  lastSavedItemId?: string
  lastUpvotedItemId?: string
  lastSavedItemFetchTime?: number
  lastUpvotedItemFetchTime?: number
}

export const reqInfoStorage = useWebExtensionStorage<RequestInfo>(
  'request-info',
  {
    rateLimits: {},
    lastSavedItemId: '',
    lastUpvotedItemId: '',
    lastSavedItemFetchTime: 0,
    lastUpvotedItemFetchTime: 0,
  },
  // prevent race conditions https://github.com/antfu/vitesse-webext/issues/162
  { eventFilter: throttleFilter(200) },
)
