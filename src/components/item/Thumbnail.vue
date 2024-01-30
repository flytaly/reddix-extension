<script setup lang="ts">
import { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  onClick?: ((e: Event) => void) | null
  item: WrappedItem
}>()
const media = computed(() => props.item.media)
</script>

<template>
  <div class="relative max-h-[4.5rem] flex-shrink-0 rounded bg-surface-100 dark:bg-surface-800">
    <component
      :is="onClick ? 'button' : 'div'"
      :title="onClick ? 'click to preview image' : ''"
      v-on="onClick ? { click: onClick } : {}"
    >
      <img v-if="media.thumbnail" class="h-[4.5rem] w-24 rounded object-cover" :src="media.thumbnail" />
      <div v-else-if="media.generic" class="flex h-[4.5rem] w-24 items-center justify-center">
        <div v-if="media.generic === 'nsfw'" class="font-bold text-surface-500 dark:text-surface-500">NSFW</div>
        <PhLink v-else-if="media.generic === 'default'" class="h-7 w-7 text-surface-500 dark:text-surface-500" />
        <PhFileTextLight v-else class="h-7 w-7 text-surface-500 dark:text-surface-500" />
      </div>
    </component>

    <span v-if="onClick">
      <PhImagesSquare
        v-if="item.isVideo"
        class="absolute bottom-0 right-0 h-4 w-4 rounded-tl bg-surface-100 dark:bg-surface-900"
      />
      <PhPlayCircle
        v-else-if="item.isGallery"
        class="absolute bottom-0 right-0 h-4 w-4 rounded-tl bg-surface-100 dark:bg-surface-900"
      />
      <PhImageSquare
        v-else-if="media.source"
        class="absolute bottom-0 right-0 h-4 w-4 rounded-tl bg-surface-100 dark:bg-surface-900"
      />
    </span>
  </div>
</template>
