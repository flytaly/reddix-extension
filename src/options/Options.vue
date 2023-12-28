<script setup lang="ts">
import Items from '~/components/Items.vue'
import SearchItems from '~/components/SearchItems.vue'
import { setupStatsStore } from '~/logic/store'
import Sidebar from '~/components/Sidebar.vue'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})
</script>

<template>
  <main class="grid min-h-screen grid-cols-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light">
    <Sidebar />
    <div class="mx-auto flex w-full max-w-[60rem] flex-col items-center p-4">
      <SearchItems />
      <div class="mt-4 w-full">
        <Items />
      </div>
    </div>
  </main>
</template>

<style lang="postcss">
main {
  /* Prevent layout shift caused by scrollbar */
  margin-right: calc(-1 * (100vw - 100%));
}
</style>
