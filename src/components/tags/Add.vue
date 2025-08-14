<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import { ref } from 'vue'
import { db } from '~/logic/db'
import { getTagsArray, stats } from '~/logic/stores'

const { ids, onUpdate } = defineProps<{
  ids: WrappedItem['dbId'][]
  onUpdate?: (update: Record<number, string[]>) => void
}>()

const allTags = ref<Array<[string, number]>>([])

async function commit(tags: string[]) {
  const set = new Set(tags)
  const updates: Record<number, string[]> = {}
  try {
    await db.redditItems
      .where('_id')
      .anyOf(ids)
      .modify((item) => {
        const prevTags = item._tags || []
        const union = new Set([...prevTags, ...set])
        item._tags = Array.from(union)
        updates[item._id] = Array.from(union)
      })
    onUpdate?.(updates)
  }
  catch (error) {
    console.error('Update tags', error)
  }
}

watch(() => stats.tags, () => {
  allTags.value = getTagsArray().filter(t => t[0] !== '')
}, { immediate: true })
</script>

<template>
  <TagsAutocomplete
    :tag-list="allTags"
    @select="commit"
  />
</template>
