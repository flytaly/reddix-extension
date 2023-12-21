<script setup lang="ts">
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'
import type { SavedRedditItem } from '~/logic/db'
import Button from 'primevue/button'

defineProps<{ items?: SavedRedditItem[]; toggle: () => void }>()

function getTitle(post: RedditItem) {
  return (post as RedditPostData).title || (post as RedditCommentData).body
}

function itemType(post: RedditItem): string {
  if (post.name.startsWith('t3')) {
    return 'Post'
  }
  return 'Comment'
}
</script>

<template>
  <ol class="flex max-w-[40rem] list-inside list-decimal flex-col gap-4 text-left">
    <li
      v-for="post in items"
      :key="post.id"
      class="flex max-w-full items-center gap-1 overflow-hidden text-ellipsis py-2 text-sm"
      :data-reddit-name="post.name"
    >
      <span class="line-clamp-3">
        <b>{{ itemType(post) }}</b>
        <span>: </span>
        <span>
          {{ getTitle(post) }}
        </span>
      </span>
      <button
        size="small"
        outlined
        class="h-4 w-4 flex-shrink-0 self-start border-0 px-0 py-0"
        title="Add tags"
        @click="toggle"
      >
        <span class="text-primary-600 hover:text-primary-400 active:text-primary-500 dark:text-primary-300">
          <ph-tag-duotone />
        </span>
      </button>
    </li>
  </ol>
</template>
