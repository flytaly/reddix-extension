<script setup lang="ts">
import { usePreferredDark } from '@vueuse/core'
import PhUploadBold from '~icons/ph/upload-bold'
import PhMagnifyingGlassBold from '~icons/ph/magnifying-glass-bold'
import PhClockCounterClockwiseBold from '~icons/ph/clock-counter-clockwise-bold'
import PhDownloadBold from '~icons/ph/download-bold'

import { RoutePath } from '~/options/routes'
import { themeStorage } from '~/logic/storage'

const items = [
  { label: 'Search', route: RoutePath.Search, iconCmp: PhMagnifyingGlassBold },
  {
    label: 'Backup',
    iconCmp: PhClockCounterClockwiseBold,
    items: [
      { label: 'Import', route: RoutePath.Import, iconCmp: PhDownloadBold },
      { label: 'Export', route: RoutePath.Export, iconCmp: PhUploadBold },
    ],
  },
]

const preferDark = usePreferredDark()

const isDark = computed(() => {
  return themeStorage.value === 'auto' ? preferDark.value : themeStorage.value === 'dark'
})

function toggleTheme() {
  themeStorage.value = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <header>
    <Menubar
      :model="items"
      :pt="{ root: 'min-h-[2rem] bg-surface-50 dark:bg-surface-950', menu: 'mx-auto' }"
      :pt-options="{ mergeProps: true }"
    >
      <template #start>
        <router-link :to="RoutePath.Search" class="flex items-center">
          <ph-bookmarks-bold class="h-7 w-7 text-primary-400" />
        </router-link>
      </template>
      <template #item="{ item, props }">
        <router-link v-if="item.route" :to="item.route" v-bind="props.action" class="flex items-center gap-x-1">
          <component :is="item.iconCmp" class="h-5 w-5" />
          <span>{{ item.label }}</span>
        </router-link>
        <a v-if="item.items" v-bind="props.action" class="flex items-center gap-x-1">
          <component :is="item.iconCmp" class="h-5 w-5" />
          <span>{{ item.label }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="m12 15.4l-6-6L7.4 8l4.6 4.6L16.6 8L18 9.4z" />
          </svg>
        </a>
      </template>
      <template #end>
        <button title="Toggle theme" @click="toggleTheme">
          <ph-sun v-if="!isDark" class="h-5 w-5" />
          <ph-moon v-else class="h-5 w-5" />
        </button>
      </template>
    </Menubar>
  </header>
</template>
