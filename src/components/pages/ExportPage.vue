<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import RadioButton from 'primevue/radiobutton'
import MainLayout from '~/components/pages/MainLayout.vue'
import { db } from '~/logic/db'
import PhUploadBold from '~icons/ph/download-bold'
import { filterProperties, type ExportedItem } from '~/logic/transform/export-utils'
import { objectsToCsv } from '~/logic/transform/export-csv'

const REDDIT_URL = 'https://www.reddit.com'

const selected = ref<'JSON' | 'CSV'>('CSV')

async function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function exportJson() {
  const items: ExportedItem[] = []
  await db.savedItems.each((obj) => {
    items.push(filterProperties(obj))
  })
  const blob = new Blob([JSON.stringify(items)], { type: 'application/json' })

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '_')
  downloadBlob(blob, `reddit-saved-items_${date}.json`)
}

async function exportCsv() {
  const items: { id: string; permalink: string }[] = []
  await db.savedItems.each((obj) => {
    items.push({ id: obj.name, permalink: REDDIT_URL + obj.permalink })
  })
  const csv = objectsToCsv(items)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `reddit-saved-items_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.csv`)
}

async function exportItems() {
  switch (selected.value) {
    case 'JSON':
      await exportJson()
      break
    case 'CSV':
      await exportCsv()
      break
  }
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
        <div class="my-8 flex flex-col flex-wrap gap-3">
          <div class="flex items-center">
            <RadioButton v-model="selected" input-id="CSV" name="CSV" value="CSV" />
            <label for="CSV" class="ml-2">CSV (only item id and link)</label>
          </div>
          <div class="flex items-center">
            <RadioButton v-model="selected" input-id="JSON" name="JSON" value="JSON" />
            <label for="JSON" class="ml-2">JSON (full data)</label>
          </div>
        </div>
        <div>
          <Button label="Export" @click="exportItems" />
        </div>
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
