<script setup lang="ts">
import { defineProps } from 'vue'
import { type PostMedia } from '~/reddit/post-media'
import { type SavedRedditPost } from '~/logic/db'
import { getFullLink } from '~/logic/convert-link'

const props = defineProps<{
  media: PostMedia
  item: SavedRedditPost
}>()

const overlayImgLoading = ref<'initial' | 'loading' | 'loaded'>('initial')

onMounted(() => {
  setTimeout(() => {
    if (overlayImgLoading.value === 'initial') overlayImgLoading.value = props.media.video ? 'loaded' : 'loading'
  }, 200)
})
</script>

<template>
  <div class="relative min-h-32 min-w-32">
    <div v-if="!media.video && media.source">
      <div v-if="overlayImgLoading === 'loading'" class="w-32">
        <PhSpinnerGap class="m-auto h-8 w-8 animate-spin" />
      </div>
      <img :src="media.source.url" alt="preview" class="limit aspect-auto" @load="overlayImgLoading = 'loaded'" />
      <a v-if="item.is_gallery" :href="getFullLink(item.permalink)" class="link">
        <PhImagesLight />
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
      <source :src="media.video.url" />
    </video>
  </div>
</template>

<style lang="postcss" scoped>
.limit {
  max-width: 40vw;
  max-height: 50vh;
}

.link {
  @apply absolute bottom-0 right-0 flex items-center gap-1 rounded-tl
         bg-surface-50 bg-opacity-95 px-1 text-center
         text-base text-dark dark:bg-surface-900 dark:bg-opacity-95 dark:text-light;
}
</style>
