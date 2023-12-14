<script setup lang="ts">
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'

defineProps<{ items?: RedditItem[] }>()

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
  <ul class="gap-4 flex flex-col text-left whitespace-nowrap max-w-xs">
    <li v-for="post in items" :key="post.id" class="text-ellipsis overflow-hidden max-w-full">
      <b>{{ itemType(post) }}</b>
      <span>: </span>
      <span>
        {{ getTitle(post) }}
      </span>
    </li>
  </ul>
</template>
