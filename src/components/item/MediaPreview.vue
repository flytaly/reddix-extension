<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  item: WrappedItem
}>()

const overlayImgLoading = ref<'initial' | 'loading' | 'loaded'>('initial')

const media = computed(() => props.item.media)

onMounted(() => {
  setTimeout(() => {
    if (overlayImgLoading.value === 'initial')
      overlayImgLoading.value = media.value.video ? 'loaded' : 'loading'
  }, 200)
})
</script>

<template>
  <div v-if="media.video || media.source" class="relative min-h-32 min-w-32 max-w-max">
    <div v-if="!media.video && media.source">
      <div v-if="overlayImgLoading === 'loading'" class="flex h-32 w-32 items-center justify-center">
        <PhSpinnerGap class="m-auto h-8 w-8 animate-spin" />
      </div>
      <img :src="media.source.url" alt="preview" class="limit aspect-auto" @load="overlayImgLoading = 'loaded'">
      <a
        v-if="item.isGallery" :href="item.fullLink"
        class="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl bg-surface-50/95 px-2 text-center text-base text-dark hover:text-primary-400 dark:bg-surface-900/95 dark:text-light whitespace-nowrap"
      >
        <PhImagesSquare />
        view full gallery
      </a>
    </div>
    <video
      v-if="media.video"
      class="limit bg-black"
      :width="media.video.width"
      :height="media.video.height"
      controls
      controlslist="nofullscreen"
    >
      <source :src="media.video.url">
    </video>
  </div>
</template>

<style lang="postcss" scoped>
.limit {
  max-width: 50vw;
  max-height: 50vh;
}
</style>
