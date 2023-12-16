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
  <ol class="flex max-w-xs list-inside list-decimal flex-col gap-4 whitespace-nowrap text-left">
    <li v-for="post in items" :key="post.id" class="max-w-full overflow-hidden text-ellipsis">
      <b>{{ itemType(post) }}</b>
      <span>: </span>
      <span>
        {{ getTitle(post) }}
      </span>
    </li>
  </ol>
</template>
