<script setup lang="ts">
import type { SavedRedditItem } from '~/logic/db'
import { setTag, setSubreddit, setAuthor } from '~/logic/search-store'
import ItemCard from '~/components/ItemCard.vue'

const { onRemove } = defineProps<{
  items?: SavedRedditItem[]
  addTags: (e: MouseEvent) => void
  onRemove: (ids: number[]) => void
}>()

function removeItem(id: number) {
  onRemove([id])
}
</script>

<template>
  <ol class="flex w-full flex-col gap-4 text-left">
    <li v-for="item in items" :key="item.id" :data-reddit-name="item.name" class="max-w-full">
      <ItemCard
        :item="item"
        @add-tags="addTags"
        @tag-click="setTag"
        @subreddit-click="setSubreddit"
        @author-click="setAuthor"
        @remove="removeItem"
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
