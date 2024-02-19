<script setup lang="ts">
import PhMagnifyingGlassBold from '~icons/ph/magnifying-glass-bold'
import PhGear from '~icons/ph/gear'
import PhCloudArrowDown from '~icons/ph/cloud-arrow-down'
import { useToast } from 'primevue/usetoast'
import { sendMessage } from 'webext-bridge/popup'

import SearchInput from '~/components/SearchInput.vue'
import ItemsContainer from '~/components/item/ItemsContainer.vue'
import { useThemeToggle } from '~/composables/useThemeToggle'
import { setupStatsStore, state } from '~/logic/options-stores'
import { userName } from '~/logic/browser-storage'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})

watch(
  () => state.isFetching,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      toast.add({ severity: 'info', summary: 'Info', detail: 'The fetching has started', life: 2000 })
    }
  },
)

watch(
  () => state.fetchError,
  (newValue) => {
    if (newValue) {
      toast.add({ severity: 'error', summary: 'Error', detail: newValue, life: 4000 })
    }
    browser.tabs.create({ url: getUrl('/') })
  },
)

const toast = useToast()

function getUrl(url: string) {
  return browser.runtime.getURL('dist/options/index.html#' + url)
}

const { isDark, toggleTheme } = useThemeToggle()

async function fetchClick() {
  if (!userName.value) {
    await browser.tabs.create({ url: getUrl('/#fetch') })
    return
  }
  await sendMessage('fetch-items', { username: userName.value, category: 'saved' }, 'background')
}
</script>

<template>
  <Toast />
  <div class="h-[550px] w-[var(--popup-width)] bg-surface-50 text-dark dark:bg-surface-950 dark:text-light">
    <header class="flex items-center gap-4 border-b border-surface-300 px-2 py-1 font-medium dark:border-surface-600">
      <ph-bookmarks-bold class="icon text-primary-400" />
      <a class="flex items-center gap-0.5 text-sm" :href="getUrl('/')" title="Open the search page in a new tab">
        <ph-magnifying-glass-bold class="icon" />
        Open app
      </a>
      <button
        class="link-like ml-auto"
        :title="state.isFetching ? 'fetching' : 'Fetch saved items'"
        :disabled="state.isFetching"
        @click="fetchClick"
      >
        <ph-cloud-arrow-down v-if="!state.isFetching" class="icon" />
        <ph-spinner-gap v-if="state.isFetching" class="icon animate-spin" />
      </button>
      <a :href="getUrl('/options')" title="Options">
        <ph-gear class="icon" />
      </a>
      <button class="link-like" title="Toggle theme" @click="toggleTheme">
        <ph-sun v-if="!isDark" class="h-5 w-5" />
        <ph-moon v-else class="h-5 w-5" />
      </button>
    </header>
    <main class="h-full w-full">
      <div class="px-2 pt-1">
        <SearchInput />
      </div>
      <ItemsContainer />
    </main>
  </div>
</template>

<style lang="postcss" scoped>
.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
