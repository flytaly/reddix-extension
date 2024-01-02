<script setup lang="ts">
import PhMagnifyingGlassBold from '~icons/ph/magnifying-glass-bold'
import PhClockCounterClockwiseBold from '~icons/ph/clock-counter-clockwise-bold'
import PhUploadBold from '~icons/ph/upload-bold'
import PhDownloadBold from '~icons/ph/download-bold'

import { defineProps } from 'vue'

const props = defineProps<{ name?: string }>()

let Icon: typeof PhMagnifyingGlassBold

switch (props.name) {
  case 'search':
    Icon = PhMagnifyingGlassBold
    break
  case 'backup':
    Icon = PhClockCounterClockwiseBold
    break
  case 'import':
    Icon = PhDownloadBold
    break
  case 'export':
    Icon = PhUploadBold
    break
}
</script>

<template>
  <Icon class="h-4 w-4" />
</template>
