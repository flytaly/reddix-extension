<script setup lang="ts">
import type { DbRedditItem } from '~/logic/db'
import { db } from '~/logic/db'
import type { WrappedItem } from '~/logic/wrapped-item'
import TagsInputAutocomplete from '~/components/tags/TagsInputAutocomplete.vue'

type TagList = [string, number][]

const props = defineProps<{
  item: WrappedItem
  onExit: (update: Record<number, string[]>) => void
}>()

const initial = props.item.tags.map(tag => [tag, 0]) as TagList

function exit(tags: TagList) {
  props.onExit({ [props.item.dbId]: tags.map(([tag]) => tag) })
}

async function commit(tags: TagList) {
  const set = new Set(tags.map(v => v[0]))
  await db.redditItems
    .where('_id')
    .equals(props.item.dbId)
    .modify({ _tags: Array.from(set) } as Partial<DbRedditItem>)
}
</script>

<template>
  <TagsInputAutocomplete :initial-tags="initial || []" @exit="exit" @select="commit" />
</template>
