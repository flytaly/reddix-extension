<script setup lang="ts">
import { getTagsArray } from '~/logic/options-stores'
import { setTag } from '~/logic/search-store'

const props = defineProps<{
  onTagSelect?: (tag: string) => void
}>()

async function onTagClick(e: MouseEvent) {
  const tag = (e.currentTarget as HTMLElement).dataset.tag
  if (!tag) return
  setTag(tag)
  props.onTagSelect?.(tag)
}
</script>

<template>
  <article class="scrollbar max-h-full max-w-full flex-col gap-1 px-2 pb-2 text-sm sm:flex">
    <h2 class="flex gap-1 font-bold">
      <ph-hash />
      Tags
    </h2>
    <ul>
      <li v-for="[tag, count] in getTagsArray()" :key="tag">
        <a
          href="#"
          class="flex justify-between gap-2 whitespace-pre text-surface-500 dark:text-surface-400"
          :data-tag="tag"
          @click.prevent="onTagClick"
        >
          <span class="max-w-52 text-ellipsis">#{{ tag }}</span>
          <span>{{ count }}</span>
        </a>
      </li>
    </ul>
  </article>
</template>

<style lang="postcss" scoped>
.scrollbar {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: theme('colors.surface-400') theme('colors.surface-200');

  &:hover {
    scrollbar-color: theme('colors.primary-500') theme('colors.surface-200');
  }
}

.dark .scrollbar {
  scrollbar-color: theme('colors.surface-600') theme('colors.surface-800');

  &:hover {
    scrollbar-color: theme('colors.primary-500') theme('colors.surface-800');
  }
}
</style>
