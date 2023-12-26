<script setup lang="ts">
import Button from 'primevue/button'
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'
import type { SavedRedditItem } from '~/logic/db'
import { setTag } from '~/logic/search-store'

defineProps<{ items?: SavedRedditItem[]; addTags: () => void }>()

function getTitle(item: RedditItem) {
  return (item as RedditPostData).title || (item as RedditCommentData).link_title
}

function getBody(item: RedditItem) {
  return (item as RedditPostData).selftext || (item as RedditCommentData).body
}

function makeFullLink(endpoint: string) {
  return `https://reddit.com${endpoint}`
}

function itemType(post: RedditItem): string {
  if (post.name.startsWith('t3')) {
    return 'post'
  }
  return 'comment'
}

async function onTagClick(e: MouseEvent) {
  const tag = (e.currentTarget as HTMLElement).dataset.tag
  if (!tag) return
  setTag(tag)
}
</script>

<template>
  <ol class="flex max-w-[40rem] flex-col gap-4 text-left">
    <li
      v-for="item in items"
      :key="item.id"
      :data-reddit-name="item.name"
      class="max-w-full overflow-hidden text-ellipsis py-2 text-sm"
    >
      <div class="rounded-md p-1">
        <div class="flex w-full justify-between gap-2 text-xs">
          <span>
            <span class="dimmed-2">{{ itemType(item) }}</span>
            <span class="dimmed-2"> in </span>
            <span class="dimmed-1">r/{{ item.subreddit }} </span>
            <span class="dimmed-2"> by </span>
            <span class="dimmed-1">u/{{ item.author }} </span>
          </span>
          <span class="dimmed-2 ml-auto">[{{ new Date(item.created * 1000).toLocaleDateString() }}]</span>
        </div>
        <div>
          <a class="flex items-center gap-2 text-dark dark:text-light" :href="makeFullLink(item.permalink)">
            {{ getTitle(item) }}
          </a>
        </div>
        <div class="dimmed-1 mt-1 flex gap-1 text-sm">
          <div class="line-clamp-2">
            {{ getBody(item) }}
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
    </li>
  </ol>
</template>

<style lang="postcss" scoped>
.dimmed-1 {
  @apply text-surface-500 dark:text-surface-400;
}
.dimmed-2 {
  @apply text-surface-400 dark:text-surface-500;
}
</style>
