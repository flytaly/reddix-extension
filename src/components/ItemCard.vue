<script setup lang="ts">
import Button from 'primevue/button'
import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import type { SavedRedditItem } from '~/logic/db'
import { computed } from 'vue'

const { item } = defineProps<{
  item: SavedRedditItem
  addTags: () => void
  onTagClick: (e: MouseEvent) => void
  onSubredditClick: (e: MouseEvent) => void
  onAuthorClick: (e: MouseEvent) => void
}>()

const title = computed(() => (item as RedditPostData).title || (item as RedditCommentData).link_title)
const body = computed(() => (item as RedditPostData).selftext || (item as RedditCommentData).body)
const fullLink = computed(() => `https://reddit.com${item.permalink}`)
const itemType = computed(() => {
  if (item.name.startsWith('t3')) {
    return 'post'
  }
  return 'comment'
})
</script>

<template>
  <div class="max-w-full overflow-hidden text-ellipsis py-2 text-sm">
    <div class="rounded-md p-1">
      <div class="flex w-full justify-between gap-2 text-xs">
        <span>
          <span class="dimmed-2">{{ itemType }}</span>
          <span class="dimmed-2"> in </span>
          <a class="dimmed-1" href="#" @click.prevent="onSubredditClick">{{ item.subreddit_name_prefixed }}</a>
          <span class="dimmed-2"> by </span>
          <a class="dimmed-1" href="#" @click.prevent="onAuthorClick">u/{{ item.author }}</a>
        </span>
        <span class="dimmed-2 ml-auto">[{{ new Date(item.created * 1000).toLocaleDateString() }}]</span>
      </div>
      <div class="wrap-anywhere">
        <a class="flex items-center gap-2 text-dark dark:text-light" :href="fullLink">
          {{ title }}
        </a>
      </div>
      <div class="wrap-anywhere dimmed-1 mt-1 flex gap-1 text-sm">
        <div class="line-clamp-2">
          {{ body }}
        </div>
      </div>
    </div>

    <ul class="flex flex-wrap gap-2 pt-0.5 text-xs">
      <button
        size="small"
        outlined
        class="h-4 w-4 flex-shrink-0 self-start border-0 px-0 py-0"
        title="Add tags"
        @click="addTags"
      >
        <span class="text-primary-600 hover:text-primary-400 active:text-primary-500 dark:text-primary-300">
          <ph-tag-duotone />
        </span>
      </button>
      <li v-for="tag in item._tags" :key="tag" class="">
        <a href="#" class="dimmed-2" :data-tag="tag" @click.prevent="onTagClick"> #{{ tag }} </a>
      </li>
    </ul>
  </div>
</template>

<style lang="postcss" scoped>
.dimmed-1 {
  @apply text-surface-500 dark:text-surface-400;
}
.dimmed-2 {
  @apply text-surface-400 dark:text-surface-500;
}
.wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
