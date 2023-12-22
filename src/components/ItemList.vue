<script setup lang="ts">
import Button from 'primevue/button'
import type { RedditCommentData, RedditItem, RedditPostData } from '~/reddit/reddit-types'
import type { SavedRedditItem } from '~/logic/db'
import { setTag } from '~/logic/store'

defineProps<{ items?: SavedRedditItem[]; addTags: () => void }>()

function getTitle(post: RedditItem) {
  return (post as RedditPostData).title || (post as RedditCommentData).body
}

function itemType(post: RedditItem): string {
  if (post.name.startsWith('t3')) {
    return 'Post'
  }
  return 'Comment'
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
      v-for="post in items"
      :key="post.id"
      :data-reddit-name="post.name"
      class="max-w-full overflow-hidden text-ellipsis py-2 text-sm"
    >
      <div class="flex items-center gap-1">
        <span class="line-clamp-3">
          <b>{{ itemType(post) }}</b>
          <span>: </span>
          <span>
            {{ getTitle(post) }}
          </span>
        </span>
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
      </div>

      <ul v-if="post._tags?.length" class="flex flex-wrap gap-2 pt-0.5 text-xs">
        <li v-for="tag in post._tags" :key="tag" class="">
          <a
            href="#"
            class="text-surface-500 hover:text-primary-500 dark:text-surface-400 dark:hover:text-primary-400"
            :data-tag="tag"
            @click.prevent="onTagClick"
          >
            #{{ tag }}
          </a>
        </li>
      </ul>
    </li>
  </ol>
</template>
