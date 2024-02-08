<script setup lang="ts">
import { db } from '~/logic/db'
import { WrappedItem } from '~/logic/wrapped-item'
import TagsInputAutocomplete from '~/components/tags/TagsInputAutocomplete.vue'

type TagList = [string, number][]

const props = defineProps<{
  items: WrappedItem[]
  onExit: (update: Record<number, string[]>) => void
}>()

function exit(tags: TagList) {
  const updates: Record<number, string[]> = {}
  const set = new Set(tags.map((v) => v[0]))
  props.items.forEach((item) => {
    const union = new Set([...item.tags, ...set])
    updates[item.dbId] = Array.from(union)
  })
  props.onExit(updates)
}

async function commit(tags: TagList) {
  const set = new Set(tags.map((v) => v[0]))
  const ids = props.items.map((it) => it.dbId)
  try {
    await db.savedItems
      .where('_id')
      .anyOf(ids)
      .modify((item) => {
        const prevTags = item._tags || []
        const union = new Set([...prevTags, ...set])
        item._tags = Array.from(union)
      })
  } catch (error) {
    console.error('Update tags', error)
  }
}
</script>

<template>
  <TagsInputAutocomplete :initial-tags="[]" @exit="exit" @select="commit">
    <template #heading><h2 class="text-sm">Add tags to selected items</h2></template>
  </TagsInputAutocomplete>
</template>
