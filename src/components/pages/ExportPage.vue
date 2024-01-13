<script setup lang="ts">
import Button from 'primevue/button'
import MainLayout from '~/components/pages/MainLayout.vue'
import { SavedRedditItem, db } from '~/logic/db'
import PhUploadBold from '~icons/ph/download-bold'

async function exportBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'export.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function exportItems() {
  const items: SavedRedditItem[] = []
  await db.savedItems.each((obj) => {
    // TODO: filter properties
    items.push(obj)
  })
  const blob = new Blob([JSON.stringify(items)], { type: 'application/json' })
  exportBlob(blob)
}
</script>

<template>
  <MainLayout>
    <main class="grid grid-cols-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light">
      <div></div>
      <div class="mx-auto flex w-full max-w-[60rem] flex-col items-center p-4">
        <h2 class="flex items-center">
          <PhUploadBold class="mr-2 h-5 w-5" />
          <span> Export </span>
        </h2>
        <div>
          <Button label="Export" @click="exportItems" />
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
