<script setup lang="ts">
import MainLayout from '~/components/pages/MainLayout.vue'
import { setupStatsStore } from '~/logic/store'
import { onUnmounted } from 'vue'
import PhDownloadBold from '~icons/ph/upload-bold'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})
</script>

<template>
  <MainLayout>
    <main class="grid min-h-screen grid-cols-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light">
      <div></div>
      <div class="mx-auto flex w-full max-w-[60rem] flex-col items-center p-4">
        <h2 class="flex items-center">
          <PhDownloadBold class="mr-2 h-5 w-5" />
          <span>Import</span>
        </h2>
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
