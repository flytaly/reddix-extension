import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { RateLimits } from '~/reddit/rate-limits'

export const storageDemo = useWebExtensionStorage<string>('username', '')

export const userName = computed({
  get() {
    return storageDemo.value
  },
  set(value) {
    storageDemo.value = value.trim()
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
    if (values.rateLimits?.reset) {
      values.rateLimits.reset = new Date(Date.now() + values.rateLimits.reset * 1000).getTime()
    }
    reqInfoStorage.value = { ...reqInfoStorage.value, ...values }
  },
})
