<script setup lang="ts">
import Button from 'primevue/button'
import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import type { SavedRedditItem } from '~/logic/db'
import PhTagDuotone from '~icons/ph/tag-duotone'
import PhTrashDuotone from '~icons/ph/trash-duotone'
import PhBookmarksSimpleDuotone from '~icons/ph/bookmarks-simple-duotone'
import { computed } from 'vue'

const { item } = defineProps<{
  item: SavedRedditItem
  onAddTags: (e: MouseEvent) => void
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'tag-click', tag: string): void
  (e: 'author-click', author: string): void
  (e: 'subreddit-click', subreddit: string): void
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

let confirmRemoving = ref(false)

function onRemove() {
  emit('remove', item._id)
  confirmRemoving.value = false
}
</script>

<template>
  <div class="max-w-full overflow-hidden text-ellipsis py-2 text-sm">
    <div class="rounded-md p-1">
      <div class="flex w-full justify-between gap-2 text-xs">
        <span>
          <span class="dimmed-2">{{ itemType }}</span>
          <span class="dimmed-2"> in </span>
          <a class="dimmed-1" href="#" @click.prevent="$emit('subreddit-click', item.subreddit)">{{
            item.subreddit_name_prefixed
          }}</a>
          <span class="dimmed-2"> by </span>
          <a class="dimmed-1" href="#" @click.prevent="$emit('author-click', item.author)">u/{{ item.author }}</a>
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

    <div class="dimmed-1 flex gap-2 pt-0.5 text-xs">
      <ul class="mr-auto flex flex-wrap gap-1">
        <button
          size="small"
          outlined
          class="mr-1 h-3 w-3 flex-shrink-0 self-start border-0 px-0 py-0 hover:text-primary-400 active:text-primary-500"
          title="Edit tags"
          @click="onAddTags"
        >
          <PhTagDuotone />
        </button>
        <li v-for="tag in item._tags" :key="tag">
          <a href="#" class="dimmed-2" :data-tag="tag" @click.prevent="$emit('tag-click', tag)"> #{{ tag }} </a>
        </li>
      </ul>
      <button
        v-if="!confirmRemoving"
        class="flex gap-0.5 hover:text-primary-400"
        size="small"
        outlined
        @click="confirmRemoving = true"
      >
        <PhTrashDuotone class="shrink-0" />
        remove
      </button>
      <div v-if="confirmRemoving">
        <span class="text-primary-400"> Remove the item? </span>
        <button class="hover:text-primary-400" @click="onRemove">Yes</button>
        <span class="mx-2">/</span>
        <button class="hover:text-primary-400" @click="confirmRemoving = false">No</button>
      </div>
      <button class="flex gap-0.5 whitespace-nowrap hover:text-primary-400">
        <PhBookmarksSimpleDuotone class="shrink-0" />
        unsave on reddit
      </button>
    </div>
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
