<script setup lang="ts">
import { WrappedItem } from '~/logic/wrapped-item'

defineProps<{
  onClick?: (e: Event) => void
  item: WrappedItem
}>()
</script>

<template>
  <button
    class="flex h-full w-10 items-center justify-center rounded hover:bg-surface-100 hover:dark:bg-surface-800"
    title="Expand or Collapse the item"
    @click="onClick"
  >
    <PhFileTextLight class="h-7 w-7 text-surface-500 dark:text-surface-500" />
  </button>
</template>

<style scoped></style>
