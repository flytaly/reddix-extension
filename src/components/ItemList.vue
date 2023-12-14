<script setup lang="ts">
import { db, find } from '~/logic/db'
import { store } from '~/logic/store'
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'

const props = defineProps({
  query: String,
})

const posts = ref<RedditItem[]>()

async function getPostsFromDB(query?: string) {
  // TODO: handle errors
  if (!query) {
    db.savedItems.toArray().then((result) => {
      posts.value = result
    })
    return
  }

  const res = await find(query.split(' ').map((s) => s.toLowerCase().trim()))
  posts.value = res
}

getPostsFromDB(props.query)

watch(
  () => store.isFetching,
  (isFetching) => {
    if (!isFetching) {
      getPostsFromDB(props.query)
    }
  },
)

watch(props, async (newValue) => {
  getPostsFromDB(newValue.query)
})

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
