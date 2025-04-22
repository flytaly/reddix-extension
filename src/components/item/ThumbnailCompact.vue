<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  onClick?: (e: Event) => void
  item: WrappedItem
}>()

const htmlTag = computed(() => (props.item.isLink ? 'a' : 'button'))
const clickHandler = computed(() => (props.onClick && !props.item.isLink ? props.onClick : null))
const title = computed(() => (props.item.isLink ? 'Open Link' : 'Expand or Collapse the item'))
const href = computed(() => (props.item.isLink ? props.item.url : ''))
</script>

<template>
  <component
    :is="htmlTag"
    :title="title"
    :href="href"
    class="flex h-full w-8 items-center justify-center rounded-sm hover:bg-surface-100 xs:w-10 dark:hover:bg-surface-800"
    v-on="clickHandler ? { click: clickHandler } : {}"
  >
    <PhChatText v-if="item.itemType === 'comment'" class="icon" />
    <PhPlayCircle v-else-if="item.isVideo" class="icon" />
    <PhImagesSquare v-else-if="item.isGallery" class="icon" />
    <PhArrowSquareOut v-else-if="item.isLink" class="icon" />
    <PhImageSquare v-else-if="item.media.source && !item.hasBody" class="icon" />
    <PhFileTextLight v-else class="icon" />
  </component>
</template>

<style scoped lang="postcss">
@reference "../../styles/tailwind.css";

.icon {
  @apply h-7 w-7 text-surface-500 dark:text-surface-500;
}
</style>
