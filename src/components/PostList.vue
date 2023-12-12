<script setup lang="ts">
import { liveQuery } from 'dexie'
import { db } from '~/db'
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'

const posts = ref<RedditItem[]>()

const obs = liveQuery(() => db.items.toArray())
const sub = obs.subscribe({
  next: (result) => {
    posts.value = result
  },
  error: (error) => console.error(error),
})

onUnmounted(() => {
  sub.unsubscribe()
})

function getTitle(post: RedditItem) {
  return (post as RedditPostData).title || (post as RedditCommentData).body
}
</script>

<template>
  <h2>Posts:</h2>
  <ul>
    <li v-for="post in posts" :key="post.id">{{ getTitle(post) }}</li>
  </ul>
</template>
