<script setup lang="ts">
import { useRoute } from 'vue-router'
import Logo from '~/assets/logo_short.svg?component'
import AccountInputBlock from '~/components/AccountInputBlock.vue'
import TagList from '~/components/TagList.vue'
import { useThemeToggle } from '~/composables/useThemeToggle'
import { RoutePath } from '~/options/routes'

const { isDark, toggleTheme } = useThemeToggle()

const tagSidebarOn = ref(false)
const accSidebarOn = ref(false)

const route = useRoute()
</script>

<template>
  <header
    class="relative flex items-center rounded-md shadow-md ring-1 ring-inset ring-surface-100 dark:ring-surface-800 ring-offset-0 !min-h-[2.5rem] bg-surface-50 dark:bg-surface-950 px-1 sm:py-1 sm:px-4 gap-4"
  >
    <!-- Logo -->
    <router-link
      :to="route.path !== RoutePath.Search ? RoutePath.Search : RoutePath.Help"
      class="group flex"
    >
      <div class="w-[calc(0.5rem+25px)] xs:w-[calc(1rem+30px)]">
        <div
          :to="RoutePath.Search"
          class="absolute left-2 top-2 w-[25px] transition-transform group-hover:translate-y-1 xs:left-4 xs:top-1 xs:w-[30px]"
        >
          <Logo
            class="h-auto w-full text-primary-600 opacity-90 group-hover:text-primary-700 dark:text-primary-500 dark:group-hover:text-primary-600"
          />
        </div>
      </div>
      <div class="text-sm font-semibold">
        Reddix
      </div>
    </router-link>

    <NavMenu />

    <!-- Right -->
    <div class="flex gap-1 ml-auto">
      <button
        class="btn flex w-max items-center rounded-sm px-1 py-0.5 text-sm text-surface-600 dark:text-surface-400 md:hidden"
        title="show tags"
        @click="tagSidebarOn = true"
      >
        <ph-hash class="h-5 w-5 shrink-0" />
      </button>
      <button
        class="btn flex w-max items-center rounded-sm px-1 py-0.5 text-sm text-surface-600 dark:text-surface-400 md:hidden"
        title="account"
        @click="accSidebarOn = true"
      >
        <ph-user class="h-5 w-5 shrink-0" />
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
  </header>
</template>
