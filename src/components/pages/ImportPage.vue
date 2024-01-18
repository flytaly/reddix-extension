<script setup lang="ts">
import MainLayout from '~/components/pages/MainLayout.vue'
import PhDownloadBold from '~icons/ph/upload-bold'
import RateLimitsBlock from '~/components/RateLimitsBlock.vue'
import LogList from '~/components/LogList.vue'
import { importCSV, importJSON } from '~/logic/transform/import-utils'

const isImporting = ref(false)

async function update(e: Event) {
  if (isImporting.value) return
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  isImporting.value = true
  if (file.type.match(/text\/csv/i)) {
    await importCSV(file)
  } else if (file.type.match(/application\/json/i)) {
    await importJSON(file)
  }
  isImporting.value = false
}
</script>

<template>
  <MainLayout>
    <main
      class="mx-auto grid max-w-screen-md grid-cols-[auto_1fr] grid-rows-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light"
    >
      <div />
      <h2 class="mt-8 flex justify-center">
        <span>Import</span>
      </h2>
      <aside class="mr-auto px-4">
        <RateLimitsBlock />
      </aside>
      <div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
        <div>
          <label
            class="flex rounded-sm bg-primary-500 px-2.5 py-1.5 text-sm font-semibold text-light shadow-sm hover:bg-primary-600 dark:bg-primary-400 dark:text-surface-900 dark:hover:bg-primary-300"
          >
            <PhDownloadBold class="mr-2 h-5 w-5" />
            <span>{{ isImporting ? 'Importing' : 'Choose' }}</span>
            <input type="file" class="hidden" accept=".json,.csv" :disabled="isImporting" @change="update" />
          </label>
        </div>
        <LogList />
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
