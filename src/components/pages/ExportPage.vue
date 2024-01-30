<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'

import MainLayout from '~/components/pages/MainLayout.vue'
import { SavedRedditItem, db, isComment, isPost } from '~/logic/db'
import { filterProperties, type ExportedItem } from '~/logic/transform/export-utils'
import { objectsToCsv } from '~/logic/transform/export-csv'
import { getFullLink } from '~/logic/convert-link'

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

async function processItems(onPost: (item: SavedRedditItem) => void, onComment: (item: SavedRedditItem) => void) {
  await db.savedItems.each((obj) => {
    if (isPost(obj)) {
      onPost(obj)
      return
    }
    if (isComment(obj)) {
      onComment(obj)
    }
  })
}

const getDate = () => new Date().toISOString().split('T')[0].replace(/-/g, '_')

async function exportJson() {
  const savedPosts: ExportedItem[] = []
  const savedComments: ExportedItem[] = []

  await processItems(
    (obj) => savedPosts.push(filterProperties(obj)),
    (obj) => savedComments.push(filterProperties(obj)),
  )

  const zip = new JSZip()

  const addFile = async (name: string, content: ExportedItem[]) => {
    const json = JSON.stringify(content)
    const blob = new Blob([json], { type: 'application/json' })
    zip.file(name, blob, { compression: 'DEFLATE' })
  }

  addFile('saved_posts.json', savedPosts)
  addFile('saved_comments.json', savedComments)

  const blob = await zip.generateAsync({ type: 'blob' })

  downloadBlob(blob, `reddit_saved_items_(json)_${getDate()}.zip`)
}

type CSVRows = { id: string; permalink: string }

async function exportCsv() {
  const savedPosts: CSVRows[] = []
  const savedComments: CSVRows[] = []

  await processItems(
    (obj) => savedPosts.push({ id: obj.name, permalink: getFullLink(obj.permalink) }),
    (obj) => savedComments.push({ id: obj.name, permalink: getFullLink(obj.permalink) }),
  )

  const zip = new JSZip()

  const addFile = async (name: string, content: CSVRows[]) => {
    const csv = objectsToCsv(content)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    zip.file(name, blob, { compression: 'DEFLATE' })
  }

  addFile('saved_posts.csv', savedPosts)
  addFile('saved_comments.csv', savedComments)

  const blob = await zip.generateAsync({ type: 'blob' })

  downloadBlob(blob, `reddit_saved_items_(csv)_${getDate()}.zip`)
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
