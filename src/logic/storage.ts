import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'

export const storageDemo = useWebExtensionStorage('username', '')

export const userName = computed({
  get() {
    return storageDemo.value
  },
  set(value) {
    storageDemo.value = value.trim()
  },
})
