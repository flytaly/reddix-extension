<script setup lang="ts">
import type { SavedRedditItem } from '~/logic/db'
import { setTag, setSubreddit, setAuthor } from '~/logic/search-store'
import ItemCard from '~/components/ItemCard.vue'

defineProps<{ items?: SavedRedditItem[]; addTags: () => void }>()

function onTagClick(e: MouseEvent) {
  const tag = (e.currentTarget as HTMLElement).dataset.tag
  if (!tag) return
  setTag(tag)
}

function onSubredditClick(e: MouseEvent) {
  const root = (e.currentTarget as HTMLElement).closest('[data-subreddit]') as HTMLElement
  const subreddit = root?.dataset.subreddit
  if (!subreddit) return
  setSubreddit(subreddit)
}

function onAuthorClick(e: MouseEvent) {
  const root = (e.currentTarget as HTMLElement).closest('[data-subreddit]') as HTMLElement
  const author = root?.dataset.author
  if (!author) return
  setAuthor(author)
}
</script>

<template>
  <ol class="flex w-full flex-col gap-4 text-left">
    <li
      v-for="item in items"
      :key="item.id"
      :data-reddit-name="item.name"
      :data-subreddit="item.subreddit"
      :data-author="item.author"
      class="max-w-full"
    >
      <ItemCard
        :item="item"
        :add-tags="addTags"
        @tag-click="onTagClick"
        @subreddit-click="onSubredditClick"
        @author-click="onAuthorClick"
      />
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
.wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
