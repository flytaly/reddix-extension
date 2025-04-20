<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import TagsInputAutocomplete from '~/components/tags/TagsInputAutocomplete.vue'
import { db } from '~/logic/db'

type TagList = [string, number][]

const props = defineProps<{
  items: WrappedItem[]
  onExit: (update: Record<number, string[]>) => void
}>()

function exit(tags: TagList) {
  const updates: Record<number, string[]> = {}
  const set = new Set(tags.map(v => v[0]))
  props.items.forEach((item) => {
    updates[item.dbId] = item.tags.filter(tag => !set.has(tag))
  })
  props.onExit(updates)
}

async function commit(tags: TagList) {
  const set = new Set(tags.map(v => v[0]))
  const ids = props.items.map(it => it.dbId)
  try {
    await db.redditItems
      .where('_id')
      .anyOf(ids)
      .modify((item) => {
        const prevTags = item._tags || []
        item._tags = prevTags.filter(tag => !set.has(tag))
      })
  }
  catch (error) {
    console.error('Update tags', error)
  }
}
</script>

<template>
  <TagsInputAutocomplete :initial-tags="[]" forbid-new @exit="exit" @select="commit">
    <template #heading>
      <h2 class="text-sm">
        Remove tags from selected items
      </h2>
    </template>
  </TagsInputAutocomplete>
</template>
