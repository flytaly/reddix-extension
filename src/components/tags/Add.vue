<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import { ref } from 'vue'
import { addTags } from '~/logic/db/mutations'
import { getTagsArray, stats } from '~/logic/stores'

const { ids, onUpdate } = defineProps<{
  ids: WrappedItem['dbId'][]
  onUpdate?: (update: Record<number, string[]>) => void
}>()

const allTags = ref<Array<[string, number]>>([])

watch(() => stats.tags, () => {
  allTags.value = getTagsArray().filter(t => t[0] !== '')
}, { immediate: true })

const tagInput = ref<string[]>([])

watch(tagInput, (tags) => {
  return addTags(ids, tags, onUpdate)
}, { deep: true })
</script>

<template>
  <TagsAutocomplete
    v-model="tagInput"
    :tag-list="allTags"
  />
</template>
