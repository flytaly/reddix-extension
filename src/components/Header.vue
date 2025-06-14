<script setup lang="ts">
import { useRoute } from 'vue-router'
import PhCircleWavyQuestion from '~icons/ph/circle-wavy-question'
import PhClockCounterClockwiseBold from '~icons/ph/clock-counter-clockwise'
import PhDownloadBold from '~icons/ph/download-bold'
import PhGear from '~icons/ph/gear'
import PhHandHeart from '~icons/ph/hand-heart-duotone'
import PhMagnifyingGlassBold from '~icons/ph/magnifying-glass'
import PhUploadBold from '~icons/ph/upload-bold'

import Logo from '~/assets/logo_short.svg?component'
import AccountInputBlock from '~/components/AccountInputBlock.vue'
import TagList from '~/components/TagList.vue'
import { useThemeToggle } from '~/composables/useThemeToggle'
import { RoutePath } from '~/options/routes'

const items = [
  { label: 'Search', route: RoutePath.Search, iconCmp: PhMagnifyingGlassBold },
  { label: 'Settings', route: RoutePath.Settings, iconCmp: PhGear },
  {
    label: 'Backup',
    iconCmp: PhClockCounterClockwiseBold,
    items: [
      { label: 'Import', route: RoutePath.Import, iconCmp: PhDownloadBold },
      { label: 'Export', route: RoutePath.Export, iconCmp: PhUploadBold },
    ],
  },
  { label: 'Help', route: RoutePath.Help, iconCmp: PhCircleWavyQuestion },
  { label: 'Support', route: RoutePath.Support, iconCmp: PhHandHeart },
]

const { isDark, toggleTheme } = useThemeToggle()

const tagSidebarOn = ref(false)
const accSidebarOn = ref(false)

const route = useRoute()
</script>

<template>
  <header>
    <Menubar
      :model="items"
      pt:root:class="relative !min-h-[2.5rem] bg-surface-50 dark:bg-surface-950 !px-1 sm:!px-4 !gap-4"
      pt:menu:class="!py-0.5"
      :pt-options="{ mergeProps: true }"
    >
      <template #start>
        <router-link :to="route.path !== RoutePath.Help ? RoutePath.Help : RoutePath.Search" class="group flex">
          <div class="w-[calc(0.5rem+25px)] xs:w-[calc(1rem+30px)]">
            <div
              :to="RoutePath.Search"
              class="absolute left-2 top-2 w-[25px] transition-transform group-hover:translate-y-1 xs:left-4 xs:top-1 xs:w-[30px]"
            >
              <Logo
                class="h-auto w-full text-primary-600 opacity-90 group-hover:text-primary-700 dark:text-primary-500 group-hover:dark:text-primary-600"
              />
            </div>
          </div>
          <div class="text-sm font-semibold">
            Reddix
          </div>
        </router-link>
      </template>
      <template #item="{ item, props }">
        <router-link v-if="item.route" :to="item.route" v-bind="props.action" class="flex items-center gap-x-0.5">
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
        <div class="flex gap-1">
          <button
            class="btn flex w-max items-center rounded px-1 py-0.5 text-sm text-surface-600 dark:text-surface-400 md:hidden"
            title="show tags"
            @click="tagSidebarOn = true"
          >
            <ph-hash class="h-5 w-5 flex-shrink-0" />
          </button>
          <button
            class="btn flex w-max items-center rounded px-1 py-0.5 text-sm text-surface-600 dark:text-surface-400 md:hidden"
            title="account"
            @click="accSidebarOn = true"
          >
            <ph-user class="h-5 w-5 flex-shrink-0" />
          </button>
          <button class="link-like" title="Toggle theme" @click="toggleTheme">
            <ph-sun v-if="!isDark" class="h-5 w-5" />
            <ph-moon v-else class="h-5 w-5" />
          </button>
        </div>

        <Sidebar v-model:visible="tagSidebarOn" header="Tags">
          <TagList @tag-select="() => (tagSidebarOn = false)" />
        </Sidebar>
        <Sidebar v-model:visible="accSidebarOn" header="Account">
          <AccountInputBlock />
        </Sidebar>
      </template>
    </Menubar>
  </header>
</template>
