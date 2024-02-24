import { tryOnScopeDispose, watchThrottled } from '@vueuse/core'
import type { Storage } from 'webextension-polyfill'
import { isEqual } from 'lodash-es'

// Arrays should be serialized, otherwise they will be represented
// as objects in the storage because of vue reactive Proxy.
export function serialize<T extends object>(obj: T) {
  return JSON.stringify(obj)
}

export function assignSerialized<T extends object>(target: T, serialized: string) {
  try {
    const data = JSON.parse(serialized)
    for (const [key, value] of Object.entries(data)) {
      if (isEqual(target[key as keyof T], value)) continue
      //@ts-ignore
      target[key as keyof T] = value
    }
  } catch (e) {
    console.error('Error parsing serialized data', e)
  }
}

export function useStorage<T extends object>(
  key: string,
  defaultValues: T,
  opts: { throttle?: number } = { throttle: 500 },
) {
  const store = reactive({ ...defaultValues })

  watchThrottled(
    store,
    (values) => {
      browser.storage.local.set({ [key]: serialize(values) })
    },
    { throttle: opts.throttle },
  )

  const listener = async (changes: Record<string, Storage.StorageChange>) => {
    if (changes[key]) {
      assignSerialized(store, changes[key].newValue as string)
    }
  }

  browser.storage.onChanged.addListener(listener)

  tryOnScopeDispose(() => {
    browser.storage.onChanged.removeListener(listener)
  })

  return store
}
