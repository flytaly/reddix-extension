<script setup lang="ts">
import MediaPreview from '~/components/item/MediaPreview.vue'
import { type SavedRedditItem } from '~/logic/db'
import { WrappedItem } from '~/logic/wrapped-item'
import ThumbnailCompact from '~/components/item/ThumbnailCompact.vue'

const props = defineProps<{
  item: SavedRedditItem
}>()

const emit = defineEmits<{
  (e: 'author-click', author: string): void
  (e: 'subreddit-click', subreddit: string): void
}>()

const item = computed(() => new WrappedItem(props.item))

const bodyElemRef = ref<HTMLElement | null>(null)
const expandable = computed(() => item.value.body || item.value.media?.source || item.value.media?.video)
const expanded = ref(false)

const toggle = () => {
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="grid grid-cols-[auto_1fr] gap-1 bg-cover pr-2">
    <!-- Toggle Bar -->
    <div class="flex h-full w-6 flex-col">
      <button
        v-if="expandable"
        class="h-full w-full hover:bg-surface-100 dark:hover:bg-surface-800"
        title="Expand or Collapse the item"
        @click="toggle"
      />
    </div>

    <div class="item w-full py-2 pr-2" :class="{ 'item__with-body': expanded }">
      <!-- Thumbnail  --->
      <ThumbnailCompact :item="item" @click="toggle">
        <PhFileTextLight class="h-7 w-7 text-surface-500 dark:text-surface-500" />
      </ThumbnailCompact>

      <!-- Header  --->
      <header class="item-header">
        <div class="inline-flex justify-between gap-2 text-xs">
          <span>
            <span class="dimmed-2">{{ item.itemType }}</span>
            <span class="dimmed-2"> in </span>
            <a class="dimmed-1" href="#" @click.prevent="$emit('subreddit-click', item.item.subreddit)">{{
              item.item.subreddit_name_prefixed
            }}</a>
            <span class="dimmed-2"> by </span>
            <a class="dimmed-1" href="#" @click.prevent="$emit('author-click', item.item.author)"
              >u/{{ item.item.author }}</a
            >
          </span>
          <span class="dimmed-2 ml-auto">[{{ new Date(item.item.created * 1000).toLocaleDateString() }}]</span>
        </div>

        <h4 class="wrap-anywhere">
          <a class="flex items-center gap-2 text-sm font-medium text-dark dark:text-light" :href="item.fullLink">
            {{ item.title }}
          </a>
        </h4>
      </header>

      <!-- Body -->
      <div
        v-if="expanded"
        class="item-body wrap-anywhere dimmed-1 relative mt-1 inline-flex w-full flex-col gap-1 text-sm"
      >
        <MediaPreview :item="item" />
        <span
          ref="bodyElemRef"
          class="item-body-html overflow-hidden"
          :class="{ 'max-h-24': !expanded }"
          v-html="item.body"
        ></span>
        <button class="flex w-full items-center justify-center gap-1" @click="expanded = false">
          <PhArrowsOutSimple />
          collapse
        </button>
      </div>

      <!-- Menu Slot -->
      <slot class="item-end" name="end"></slot>
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
  grid-template-columns: auto 1fr auto;
  gap: 0.125rem 0.5rem;
  grid-template-areas: 'thumbnail header end';
}

.item__with-body {
  grid-template-areas:
    'thumbnail header end'
    'body      body   end';
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

.item-end {
  grid-area: end;
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