<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import PhCloudArrowDown from '~icons/ph/cloud-arrow-down'
import PhGear from '~icons/ph/gear'

import Logo from '~/assets/logo_short.svg?component'
import ItemsContainer from '~/components/item/ItemsContainer.vue'
import SearchInput from '~/components/SearchInput.vue'
import { useThemeToggle } from '~/composables/useThemeToggle'
import { userName } from '~/logic/browser-storage'
import { setupMessageHandlers, setupStatsStore, state } from '~/logic/stores'
import { sendMessage } from '~/messages'

const subscription = setupStatsStore()

onMounted(async () => {
  setupMessageHandlers()
})

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})

const toast = useToast()

watch(
  () => state.isFetching,
  (newValue, oldValue) => {
    if (newValue && !oldValue)
      toast.add({ severity: 'info', summary: 'Info', detail: 'The fetching has started', life: 2000 })
  },
)

watch(
  () => state.fetchError,
  (newValue) => {
    if (newValue)
      toast.add({ severity: 'error', summary: 'Error', detail: newValue, life: 4000 })

    browser.tabs.create({ url: getUrl('/') })
  },
)

function getUrl(url: string) {
  return browser.runtime.getURL(`dist/options/index.html#${url}`)
}

const { isDark, toggleTheme } = useThemeToggle()

async function fetchClick() {
  if (!userName.value) {
    await browser.tabs.create({ url: getUrl('/#fetch') })
    return
  }
  await sendMessage('fetch-items', { username: userName.value, category: 'saved' })
}

const tagSidebarOn = ref(false)
</script>

<template>
  <Toast />
  <div class="h-[550px] w-[var(--popup-width)] bg-surface-50 text-dark dark:bg-surface-950 dark:text-light">
    <header class="flex items-center gap-4 border-b border-surface-300 px-2 py-1 font-medium dark:border-surface-600">
      <a
        class="group relative flex items-center gap-0.5 text-sm"
        :href="getUrl('/')"
        title="Open the search page in a new tab"
      >
        <div class="w-5">
          <Logo
            class="absolute left-0 top-0 h-auto w-5 text-primary-600 opacity-90 transition-transform group-hover:translate-y-0.5 dark:text-primary-500"
          />
        </div>
        Open in a new tab
      </a>
      <button
        class="link-like ml-auto"
        :title="state.isFetching ? 'fetching' : 'Fetch saved items'"
        :disabled="state.isFetching"
        @click="fetchClick"
      >
        <PhCloudArrowDown v-if="!state.isFetching" class="icon" />
        <ph-spinner-gap v-if="state.isFetching" class="icon animate-spin" />
      </button>
      <button
        class="btn flex w-max items-center rounded px-1 py-0.5 text-sm text-surface-600 dark:text-surface-400 md:hidden"
        title="show tags"
        @click="tagSidebarOn = true"
      >
        <ph-hash class="h-5 w-5 flex-shrink-0" />
      </button>
      <a :href="getUrl('/settings')" title="Settings">
        <PhGear class="icon" />
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
  <Sidebar v-model:visible="tagSidebarOn" header="Tags">
    <TagList @tag-select="() => (tagSidebarOn = false)" />
  </Sidebar>
</template>

<style lang="postcss" scoped>
.icon {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
