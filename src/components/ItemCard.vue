<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { unescape } from 'lodash-es'

import MediaPreview from '~/components/MediaPreview.vue'
import Thumbnail from '~/components/Thumbnail.vue'
import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import { type SavedRedditItem } from '~/logic/db'
import { extractMedia } from '~/reddit/post-media'

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

const media = computed(() => extractMedia(props.item))
const togglePreview = computed(() => {
  if (!media.value.video && !media.value.source) {
    return null
  }
  return (event: Event) => {
    overlayRef.value.toggle(event)
  }
})

const expandPostOrPreview = (event: Event) => {
  if (overflowen.value || expanded.value) {
    expanded.value = !expanded.value
    return
  }
  togglePreview.value?.(event)
}
</script>

<template>
  <article class="grid grid-cols-[auto_1fr] gap-1 pr-2">
    <!-- Toggle Bar -->
    <div class="flex h-full w-6 flex-col">
      <button
        v-if="togglePreview || overflowen || expanded"
        class="h-full w-full hover:bg-surface-100 dark:hover:bg-surface-800"
        title="Expand or Collapse the item"
        @click="expandPostOrPreview"
      />
    </div>

    <div class="item w-full py-2 pl-1 pr-2" :class="{ 'item__with-body': itemBody }">
      <!-- Thumbnail  --->
      <Thumbnail class="item-thumbnail" :media="media" :item="item" @click="togglePreview" />

      <!-- Header  --->
      <header class="item-header">
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
          <MediaPreview :media="media" :item="item" />
        </OverlayPanel>
      </header>

      <!-- Body -->
      <div
        v-if="itemBody"
        class="item-body wrap-anywhere dimmed-1 relative mt-1 inline-flex w-full flex-col gap-1 text-sm"
      >
        <span
          ref="bodyElemRef"
          class="item-body-html overflow-hidden"
          :class="{ 'max-h-24': !expanded }"
          v-html="itemBody"
        ></span>
        <button
          v-if="overflowen && !expanded"
          class="mask absolute bottom-0 left-0 flex w-full items-center justify-center gap-1 bg-white pt-2 text-surface-600 hover:text-primary-400 dark:bg-surface-900 dark:text-surface-400"
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
      <footer class="item-footer dimmed-1 mt-1 flex items-center gap-2 pt-0.5 text-xs">
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

        <div>
          <button class="flex gap-0.5 whitespace-nowrap hover:text-primary-400">
            <PhArrowsClockwise class="shrink-0" />
            update
          </button>
        </div>
      </footer>
    </div>
  </article>
</template>

<style lang="postcss" scoped>
article {
  @apply max-w-full overflow-hidden text-ellipsis bg-surface-0 text-sm
         ring-1 ring-surface-200 hover:z-10
         hover:ring-surface-400 dark:bg-surface-900 dark:ring-surface-800 dark:hover:ring-surface-600;

  &:first-child {
    @apply rounded-t;
  }
  &:last-child {
    @apply rounded-b;
  }
}

.item {
  display: grid;
  align-items: start;
  justify-content: start;
  grid-template-columns: auto 1fr;
  gap: 0.25rem;
  grid-template-areas:
    'thumbnail header'
    'thumbnail footer  ';
}

.item__with-body {
  grid-template-areas:
    'thumbnail header'
    'body      body  '
    'footer    footer';
}

.item-thumbnail {
  grid-area: thumbnail;
}

.item-header {
  grid-area: header;
}

.item-body {
  grid-area: body;
}

.item-footer {
  grid-area: footer;
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
