<script setup lang="ts">
import SearchItems from '~/components/SearchItems.vue'
import MainLayout from '~/components/pages/MainLayout.vue'
import { setupStatsStore } from '~/logic/store'
import Sidebar from '~/components/Sidebar.vue'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})
</script>

<template>
  <MainLayout>
    <main class="mt-4 bg-surface-50 text-dark sm:grid sm:grid-cols-[auto_1fr] dark:bg-surface-900 dark:text-light">
      <Sidebar />
      <div class="mx-auto my-4 flex w-full max-w-[60rem] flex-col items-center px-4 sm:my-0">
        <SearchItems />
        <div class="w-full">
          <Items />
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
