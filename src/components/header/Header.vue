<script setup lang="ts">
import Menubar from 'primevue/menubar'
import { ref } from 'vue'
import { RoutePath } from '~/options/routes'
import NavIcons from './NavIcons.vue'

const items = ref([
  { label: 'Search', route: RoutePath.Search, icon: 'search' },
  {
    label: 'Backup',
    icon: 'backup',
    items: [
      { label: 'Import', route: RoutePath.Import, icon: 'import' },
      { label: 'Export', route: RoutePath.Export, icon: 'export' },
    ],
  },
])
</script>

<template>
  <header>
    <Menubar :model="items" :pt="{ root: 'min-h-6', menu: 'mx-auto' }" :pt-options="{ mergeProps: true }">
      <template #start>
        <router-link :to="RoutePath.Search" class="flex items-center">
          <ph-bookmarks-bold class="h-7 w-7 text-primary-400" />
        </router-link>
      </template>
      <template #item="{ item, props }">
        <router-link v-if="item.route" :to="item.route" v-bind="props.action" class="flex items-center gap-x-1">
          <NavIcons :name="item.icon" />
          <span>{{ item.label }}</span>
        </router-link>
        <a v-if="item.items" v-bind="props.action" class="flex items-center gap-x-1">
          <NavIcons :name="item.icon" />
          <span>{{ item.label }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="m12 15.4l-6-6L7.4 8l4.6 4.6L16.6 8L18 9.4z" />
          </svg>
        </a>
      </template>
    </Menubar>
  </header>
</template>
