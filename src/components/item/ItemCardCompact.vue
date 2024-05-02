<script setup lang="ts">
import MediaPreview from '~/components/item/MediaPreview.vue'
import type { WrappedItem } from '~/logic/wrapped-item'
import ThumbnailCompact from '~/components/item/ThumbnailCompact.vue'

const props = defineProps<{
  item: WrappedItem
}>()

defineEmits<{
  (e: 'author-click', author: string): void
  (e: 'subreddit-click', subreddit: string): void
}>()

const bodyElemRef = ref<HTMLElement | null>(null)
const expandable = computed(() => props.item.body || props.item.media?.source || props.item.media?.video)
const expanded = ref(false)

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="group grid grid-cols-[auto_1fr] gap-1 bg-cover">
    <slot name="start">
      <!-- Toggle Bar -->
      <div class="flex h-full w-4 flex-col xs:w-6">
        <button
          v-if="expandable"
          class="btn h-full w-full group-hover:bg-surface-100 group-hover:hover:bg-surface-200 group-hover:dark:bg-surface-800 group-hover:hover:dark:bg-surface-700"
          title="Expand or Collapse the item"
          @click="toggle"
        />
      </div>
    </slot>

    <div class="item w-full py-1 pr-0.5 xs:py-2 xs:pr-2" :class="{ 'item__with-body': expanded }">
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
            <span class="dimmed-2 hidden xs:inline"> by </span>
            <a class="dimmed-1 hidden xs:inline" href="#" @click.prevent="$emit('author-click', item.item.author)">u/{{ item.item.author }}</a>
          </span>
          <a :href="item.fullLink">
            <ph-arrow-square-out />
          </a>
          <span class="dimmed-2 ml-auto">[{{ new Date(item.item.created * 1000).toLocaleDateString() }}]</span>
        </div>

        <h4 class="wrap-anywhere">
          <a
            class="line-clamp-1 text-sm font-medium text-dark sm:line-clamp-none dark:text-light"
            :href="item.fullLink"
            :title="item.title"
          >
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
        />
        <button class="btn flex w-full items-center justify-center gap-1" @click="expanded = false">
          <PhArrowsOutSimple />
          collapse
        </button>
      </div>

      <!-- Menu Slot -->
      <slot class="item-end" name="end" />
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
