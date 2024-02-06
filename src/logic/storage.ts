import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { RateLimits } from '~/reddit/rate-limits'

export const themeStorage = useWebExtensionStorage<'auto' | 'dark' | 'light'>('theme', 'auto')

export const optionsStorage = useWebExtensionStorage('options', {
  username: '',
})

export const userName = computed({
  get() {
    return optionsStorage.value.username
  },
  set(value) {
    optionsStorage.value.username = value.trim()
  },
})

type RequestInfo = {
  rateLimits: RateLimits
  timestamp: number
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
