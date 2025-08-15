<script setup lang="ts">
import type { AcceptableInputValue } from 'reka-ui'
import type { WrappedItem } from '~/logic/wrapped-item'
import { ref } from 'vue'
import { TagsInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '~/components/ui/tags-input'
import { removeTag } from '~/logic/db/mutations'

const { items, onUpdate, ids } = defineProps<{
  ids: WrappedItem['dbId'][]
  items: WrappedItem[]
  onUpdate?: (update: Record<number, string[]>) => void
}>()

function extractTags(items: WrappedItem[]) {
  const tags = new Set<string>()
  items.forEach((item) => {
    if (!ids.includes(item.dbId)) {
      return
    }
    item.tags.forEach((tag) => {
      tags.add(tag)
    })
  })

  return Array.from(tags)
}

const tags = ref(extractTags(items))

async function commit(removedTag: AcceptableInputValue) {
  if (typeof removedTag === 'string') {
    removeTag(ids, removedTag, onUpdate)
  }
}
</script>

<template>
  <div class="bg-popover p-1">
    <b v-if="tags.length" class="text-sm">Remove Tags:</b>
    <b v-else class="text-sm">Selected items have no tags.</b>
    <TagsInput
      v-if="tags.length"
      v-model="tags"
      class="px-2 gap-2 w-80"
      @remove-tag="commit"
    >
      <div class="flex gap-2 flex-wrap items-center">
        <TagsInputItem
          v-for="item in tags"
          :key="item"
          :value="item"
        >
          <TagsInputItemText />
          <TagsInputItemDelete />
        </TagsInputItem>
      </div>
    </TagsInput>
  </div>
</template>
