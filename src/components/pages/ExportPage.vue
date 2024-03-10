<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'

import MainLayout from '~/components/pages/MainLayout.vue'
import { DbRedditItem, db, isComment, isPost } from '~/logic/db'
import { filterProperties, type ExportedItem } from '~/logic/transform/export-utils'
import { objectsToCsv } from '~/logic/transform/export-csv'
import { getFullLink } from '~/logic/convert-link'
import { stats } from '~/logic/stores'

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

async function processItems(onPost: (item: DbRedditItem) => void, onComment: (item: DbRedditItem) => void) {
  await db.redditItems.each((obj) => {
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

function isSaved(obj: DbRedditItem) {
  if (!obj._category?.length) return true
  return obj._category.includes('saved')
}

function isUpvoted(obj: DbRedditItem) {
  if (!obj._category?.length) return false
  return obj._category.includes('upvoted')
}

async function exportJson() {
  const savedPosts: ExportedItem[] = []
  const upvotedPosts: ExportedItem[] = []
  const savedComments: ExportedItem[] = []
  const upvotedComments: ExportedItem[] = []

  await processItems(
    (obj) => {
      if (isSaved(obj)) {
        savedPosts.push(filterProperties(obj))
      }
      if (isUpvoted(obj)) {
        upvotedPosts.push(filterProperties(obj))
      }
    },
    (obj) => {
      if (isSaved(obj)) {
        savedComments.push(filterProperties(obj))
      }
      if (isUpvoted(obj)) {
        upvotedComments.push(filterProperties(obj))
      }
    },
  )

  const zip = new JSZip()

  const addFile = async (name: string, content: ExportedItem[]) => {
    const json = JSON.stringify(content)
    const blob = new Blob([json], { type: 'application/json' })
    zip.file(name, blob, { compression: 'DEFLATE' })
  }

  savedPosts.length && addFile('saved_posts.json', savedPosts)
  savedComments.length && addFile('saved_comments.json', savedComments)
  upvotedPosts.length && addFile('upvoted_posts.json', upvotedPosts)
  upvotedComments.length && addFile('upvoted_comments.json', upvotedComments)

  const blob = await zip.generateAsync({ type: 'blob' })

  downloadBlob(blob, `reddit_saved_items_(json)_${getDate()}.zip`)
}

type CSVRows = { id: string; permalink: string } | { id: string; permalink: string; direction: 'up' | 'down' | 'none' }

async function exportCsv() {
  const savedPosts: CSVRows[] = []
  const savedComments: CSVRows[] = []
  const upvotedPosts: CSVRows[] = []
  const upvotedComments: CSVRows[] = []

  await processItems(
    (obj) => {
      if (isSaved(obj)) {
        savedPosts.push({ id: obj.name, permalink: getFullLink(obj.permalink) })
      }
      if (isUpvoted(obj)) {
        upvotedPosts.push({ id: obj.name, permalink: getFullLink(obj.permalink), direction: 'up' })
      }
    },
    (obj) => {
      if (isSaved(obj)) {
        savedComments.push({ id: obj.name, permalink: getFullLink(obj.permalink) })
      }
      if (isUpvoted(obj)) {
        upvotedComments.push({ id: obj.name, permalink: getFullLink(obj.permalink), direction: 'up' })
      }
    },
  )

  const zip = new JSZip()

  const addFile = async (name: string, content: CSVRows[]) => {
    const csv = objectsToCsv(content)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    zip.file(name, blob, { compression: 'DEFLATE' })
  }

  savedPosts.length && addFile('saved_posts.csv', savedPosts)
  savedComments.length && addFile('saved_comments.csv', savedComments)
  upvotedPosts.length && addFile('post_votes.csv', upvotedPosts)
  upvotedComments.length && addFile('comment_votes.csv', upvotedComments)

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
    <Card class="mx-auto mt-2 w-full max-w-[120ch]">
      <template #title>
        <h2 class="flex items-center">
          <ph-upload-bold class="mr-2 h-5 w-5" />
          <span>Export</span>
        </h2>
      </template>
      <template #content>
        <main>
          <div class="mx-auto flex w-full flex-col items-center p-4">
            <div class="my-8 flex flex-col flex-wrap gap-3">
              <div class="flex items-center">
                <RadioButton v-model="selected" input-id="CSV" name="CSV" value="CSV" />
                <label for="CSV" class="ml-2">as CSV (only item id and link)</label>
              </div>
              <div class="flex items-center">
                <RadioButton v-model="selected" input-id="JSON" name="JSON" value="JSON" />
                <label for="JSON" class="ml-2">as JSON (full data)</label>
              </div>
            </div>
            <div class="space-y-1 text-center">
              <div>{{ stats.total }} items</div>
              <Button label="Export" :disabled="!stats.total" @click="exportItems" />
            </div>
          </div>
        </main>
      </template>
    </Card>
  </MainLayout>
</template>

<style lang="postcss"></style>
