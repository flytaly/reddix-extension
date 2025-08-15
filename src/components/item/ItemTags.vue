<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import Edit from '~/components/tags/Edit.vue'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

defineProps<{
  item: WrappedItem
  onTagsUpdate: (updated: Record<number, string[]>) => void
}>()

defineEmits<{
  (e: 'tag-click', tag: string): void
}>()
</script>

<template>
  <ul class="mr-auto flex flex-wrap gap-1">
    <Popover>
      <PopoverTrigger as-child>
        <button class="btn mr-1 h-3 w-3 shrink-0" title="Edit tags">
          <PhTagDuotone />
        </button>
      </PopoverTrigger>
      <PopoverContent class="w-max p-1">
        <Edit
          :item="item"
          :on-tags-update="onTagsUpdate"
        />
      </PopoverContent>
    </Popover>
    <li v-for="tag in item.tags" :key="tag">
      <a href="#" class="text-surface-400 dark:text-surface-500 break-all" :data-tag="tag" @click.prevent="$emit('tag-click', tag)">
        #{{ tag }}
      </a>
    </li>
  </ul>
</template>
