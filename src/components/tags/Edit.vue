<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import { ref } from 'vue'
import { editTags } from '~/logic/db/mutations'
import { getTagsArray, stats } from '~/logic/stores'

const { item, onTagsUpdate } = defineProps<{
  item: WrappedItem
  onTagsUpdate?: (updated: Record<number, string[]>) => void
}>()

const allTags = ref<Array<[string, number]>>([])

watch(() => stats.tags, () => {
  allTags.value = getTagsArray().filter(t => t[0] !== '')
}, { immediate: true })

const tagInput = ref<string[]>([...item.tags])

watch(tagInput, (val) => {
  editTags(item.dbId, val, onTagsUpdate)
}, { deep: true })
</script>

<template>
  <TagsAutocomplete
    v-model="tagInput"
    :tag-list="allTags"
  />
</template>
