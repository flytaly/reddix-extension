<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { unescape } from 'lodash-es'
import PhTagDuotone from '~icons/ph/tag-duotone'
import PhTrashSimpleDuotone from '~icons/ph/trash-simple-duotone'
import PhBookmarksSimpleDuotone from '~icons/ph/bookmarks-simple-duotone'
import PhArrowsOutSimple from '~icons/ph/arrows-out-simple'

import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import { type SavedRedditItem } from '~/logic/db'
import { extractMedia } from '~/reddit/utils'

const props = defineProps<{
  item: SavedRedditItem
  onAddTags: (e: MouseEvent) => void
}>()

const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'tag-click', tag: string): void
  (e: 'author-click', author: string): void
  (e: 'subreddit-click', subreddit: string): void
  (e: 'unsave', name: string): void
}>()

const title = computed(() => (props.item as RedditPostData).title || (props.item as RedditCommentData).link_title)
const itemBody = computed(() => {
  const text = (props.item as RedditPostData).selftext_html || (props.item as RedditCommentData).body_html
  return unescape(text)
})
const fullLink = computed(() => `https://reddit.com${props.item.permalink}`)
const itemType = computed(() => {
  if (props.item.name.startsWith('t3')) {
    return 'post'
  }
  return 'comment'
})

const media = computed(() => extractMedia(props.item))

const confirmRemoving = ref(false)
const confirmUnsave = ref(false)

const bodyElemRef = ref<HTMLElement | null>(null)
const overflowen = ref(false)
const expanded = ref(false)

onMounted(() => {
  const element = bodyElemRef.value
  if (element) {
    overflowen.value = isOverflowen(element)
  }
})

function isOverflowen(element: HTMLElement) {
  return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
}

function onRemove() {
  emit('remove', props.item._id)
  confirmRemoving.value = false
}

function onUnsave() {
  emit('unsave', props.item.name)
  confirmUnsave.value = false
}

const overlayRef = ref()

const togglePreview = (event: Event) => {
  overlayRef.value.toggle(event)
}
</script>

<template>
  <article class="container">
    <!-- Preview  --->
    <button
      v-if="media.thumbnail"
      class="float-left mb-2 mr-2 flex-shrink-0"
      title="click to preview image"
      @click="togglePreview"
    >
      <img class="h-[4.5rem] w-24 rounded object-cover" :src="media.thumbnail.url" />
    </button>

    <!-- Header  --->
    <header class="inline">
      <div class="inline-flex justify-between gap-2 text-xs">
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
      <h4 class="wrap-anywhere">
        <a class="flex items-center gap-2 text-base font-medium text-dark dark:text-light" :href="fullLink">
          {{ title }}
        </a>
      </h4>

      <OverlayPanel ref="overlayRef" :pt="{ content: 'p-0' }">
        <img
          v-if="!media.video && media.source"
          :src="media.source.url"
          alt="preview"
          class="aspect-auto max-h-[20rem] max-w-[38rem]"
        />
        <video
          v-if="media.video"
          class="max-h-[30rem] max-w-[38rem] bg-black"
          :width="media.video.width"
          :height="media.video.height"
          controls
          controlslist="nofullscreen"
        >
          <source :src="media.video.url" />
        </video>
      </OverlayPanel>
    </header>

    <!-- Body -->
    <div v-if="itemBody" class="body wrap-anywhere dimmed-1 relative mt-1 inline-flex flex-col gap-1 text-sm">
      <span
        ref="bodyElemRef"
        class="item-body overflow-hidden"
        :class="{ 'max-h-28': !expanded }"
        v-html="itemBody"
      ></span>
      <button
        v-if="overflowen && !expanded"
        class="mask absolute bottom-0 left-0 flex w-full items-center justify-center gap-1 bg-white pt-3 text-surface-600 hover:text-primary-400 dark:bg-surface-900 dark:text-surface-400"
        @click="expanded = true"
      >
        <PhArrowsOutSimple />
        expand
      </button>
      <button
        v-if="expanded"
        class="flex w-full items-center justify-center gap-1 text-surface-500 hover:text-primary-400 dark:text-surface-500"
        @click="expanded = false"
      >
        <PhArrowsOutSimple />
        collapse
      </button>
    </div>

    <!-- Footer -->
    <footer class="dimmed-1 mt-1 flex items-center gap-2 pt-0.5 text-xs" :class="{ 'clear-both': itemBody }">
      <ul class="mr-auto flex flex-wrap gap-1">
        <button
          size="small"
          class="mr-1 h-3 w-3 flex-shrink-0 self-start border-0 px-0 py-0 hover:text-primary-400 active:text-primary-500"
          title="Edit tags"
          @click="onAddTags"
        >
          <PhTagDuotone />
        </button>
        <li v-for="tag in item._tags" :key="tag">
          <a href="#" class="dimmed-2 break-all" :data-tag="tag" @click.prevent="$emit('tag-click', tag)">
            #{{ tag }}
          </a>
        </li>
      </ul>
      <button
        v-if="!confirmRemoving"
        title="Remove the item locally from the extension"
        class="ml-auto flex gap-0.5 hover:text-primary-400"
        size="small"
        @click="confirmRemoving = true"
      >
        <PhTrashSimpleDuotone class="shrink-0" />
        remove
      </button>
      <div v-if="confirmRemoving" class="mr-2" title="Remove the item locally from the extension">
        <span class="text-primary-400">Remove the item?</span>
        <button class="ml-2 hover:text-primary-400" @click="onRemove">Yes</button>
        <span class="mx-2">/</span>
        <button class="hover:text-primary-400" @click="confirmRemoving = false">No</button>
      </div>

      <div v-if="item.saved">
        <button
          v-if="!confirmUnsave"
          class="flex gap-0.5 whitespace-nowrap hover:text-primary-400"
          title="Unsave on Reddit. You must be logged in."
          @click="confirmUnsave = true"
        >
          <PhBookmarksSimpleDuotone class="shrink-0" />
          unsave on reddit
        </button>
        <div v-if="confirmUnsave" class="mr-2" title="Unsave on Reddit. You must be logged in.">
          <span class="text-primary-400">Unsave the item?</span>
          <button class="ml-2 hover:text-primary-400" @click="onUnsave">Yes</button>
          <span class="mx-2">/</span>
          <button class="hover:text-primary-400" @click="confirmUnsave = false">No</button>
        </div>
      </div>
    </footer>
  </article>
</template>

<style lang="postcss" scoped>
.container {
  @apply max-w-full overflow-hidden text-ellipsis bg-surface-0 px-4 py-2 text-sm ring-1
         ring-surface-200 hover:ring-surface-400
         dark:bg-surface-900 dark:ring-surface-800 dark:hover:ring-surface-700;
}

.dimmed-1 {
  @apply text-surface-700 dark:text-surface-300;
}
.dimmed-2 {
  @apply text-surface-400 dark:text-surface-500;
}
.wrap-anywhere {
  overflow-wrap: anywhere;
}
.mask {
  mask-image: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0.754)), to(rgba(0, 0, 0, 1)));
}
</style>

<style lang="postcss">
.item-body {
  p {
    @apply my-2;
  }
  p:first-child {
    @apply mt-0;
  }
  a {
    @apply underline;
  }
  blockquote {
    @apply border-l-2 border-surface-700 pl-2 dark:border-surface-400;
  }
  ol {
    @apply my-2 list-decimal pl-4;
  }
  ul {
    @apply my-2 list-disc pl-4;
  }
  code {
    @apply my-2 block bg-surface-100 p-1 font-mono dark:bg-surface-800;
  }
}
</style>
