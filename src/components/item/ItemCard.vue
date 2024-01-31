<script setup lang="ts">
import MediaPreview from '~/components/item/MediaPreview.vue'
import Thumbnail from '~/components/item/Thumbnail.vue'
import { type SavedRedditItem } from '~/logic/db'
import { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  item: SavedRedditItem
  onAddTags: (e: MouseEvent) => void
}>()

const emit = defineEmits<{
  (e: 'tag-click', tag: string): void
  (e: 'author-click', author: string): void
  (e: 'subreddit-click', subreddit: string): void
}>()

const item = computed(() => new WrappedItem(props.item))

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

const overlayRef = ref()

const togglePreview = computed(() => {
  if (!item.value.media.video && !item.value.media.source) {
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

    <div class="item w-full py-2 pl-1 pr-2" :class="{ 'item__with-body': item.body }">
      <!-- Thumbnail  --->
      <Thumbnail class="item-thumbnail" :media="item.media" :item="item" @click="togglePreview" />

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
          <a class="flex items-center gap-2 text-base font-medium text-dark dark:text-light" :href="item.fullLink">
            {{ item.title }}
          </a>
        </h4>

        <OverlayPanel ref="overlayRef" :pt="{ content: 'p-0' }">
          <MediaPreview :item="item" />
        </OverlayPanel>
      </header>

      <!-- Body -->
      <div
        v-if="item.body"
        class="item-body wrap-anywhere dimmed-1 relative mt-1 inline-flex w-full flex-col gap-1 text-sm"
      >
        <span
          ref="bodyElemRef"
          class="item-body-html overflow-hidden"
          :class="{ 'max-h-24': !expanded }"
          v-html="item.body"
        ></span>
        <button
          v-if="overflowen && !expanded"
          class="mask absolute bottom-0 left-0 flex w-full items-center justify-center gap-1 bg-white pt-2 dark:bg-surface-900"
          @click="expanded = true"
        >
          <PhArrowsOutSimple />
          expand
        </button>
        <button v-if="expanded" class="flex w-full items-center justify-center gap-1" @click="expanded = false">
          <PhArrowsOutSimple />
          collapse
        </button>
      </div>

      <!-- Footer -->
      <footer class="item-footer dimmed-1 mt-1 flex items-center gap-2 pt-0.5 text-xs">
        <ul class="mr-auto flex flex-wrap gap-1">
          <button class="mr-1 h-3 w-3 shrink-0" title="Edit tags" @click="onAddTags">
            <PhTagDuotone />
          </button>
          <li v-for="tag in item.tags" :key="tag">
            <a href="#" class="dimmed-2 break-all" :data-tag="tag" @click.prevent="$emit('tag-click', tag)">
              #{{ tag }}
            </a>
          </li>
        </ul>

        <slot name="footer-right"> </slot>
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
  gap: 0.125rem 0.5rem;
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
