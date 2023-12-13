<script setup lang="ts">
// import { liveQuery } from 'dexie'
import { db } from '~/db'
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'

const props = defineProps({
  title: String,
})

const posts = ref<RedditItem[]>()

db.savedItems.toArray().then((result) => {
  posts.value = result
})

watch(props, async (newValue) => {
  // TODO: handle errors
  if (!newValue.title.trim()) {
    db.savedItems.toArray().then((result) => {
      posts.value = result
    })
    return
  }
  await db.savedItems
    .where('title_words')
    .startsWithIgnoreCase(newValue.title)
    .distinct()
    .toArray()
    .then((result) => {
      posts.value = result
    })
})

// watch(title, (newValue) => {
//   console.log('query', newValue)
// })

// const obs = liveQuery(() => db.items.toArray())
// const sub = obs.subscribe({
//   next: (result) => {
//     posts.value = result
//   },
//   error: (error) => console.error(error),
// })
//
// onUnmounted(() => {
//   sub.unsubscribe()
// })

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
  <h2>Posts:</h2>
  <div class="flex items-center justify-center">
    <ul class="gap-4 flex flex-col text-left whitespace-nowrap max-w-xs">
      <li v-for="post in posts" :key="post.id" class="text-ellipsis overflow-hidden max-w-full">
        <b>{{ itemType(post) }}</b>
        <span>: </span>
        <span>
          {{ getTitle(post) }}
        </span>
      </li>
    </ul>
  </div>
</template>
