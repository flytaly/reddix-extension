<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import Add from '~/components/tags/Add.vue'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

const props = defineProps<{
  items: WrappedItem[]
  onLoadAll: () => Promise<void>
  onDelete: (ids: number[]) => Promise<void>
  onTagsUpdate: (updated: Record<number, string[]>) => void
}>()

const checkedIds = defineModel<number[]>()
const checkedAll = ref<boolean | 'indeterminate'>(false)

function checkAllHandler() {
  checkedAll.value = !checkedAll.value
  checkedIds.value = checkedAll.value ? props.items.map(it => it.dbId) : []
}

watch(checkedIds, (ids) => {
  checkedAll.value = !ids?.length ? false : ids.length === props.items.length ? true : 'indeterminate'
})

const confirmDeletion = ref(false)

async function deleteItems() {
  await props.onDelete(checkedIds.value || [])
  checkedIds.value = []
  confirmDeletion.value = false
}
</script>

<template>
  <div class="mx-auto mb-2 mr-auto flex w-full max-w-main-column flex-wrap items-center gap-x-2 px-2 pl-2">
    <Checkbox
      v-model="checkedAll"
      title="select all"
      @click="checkAllHandler"
    />
    <span class="ml-2"> selected {{ checkedIds?.length || 0 }} / {{ items?.length }}</span>
    <slot />
    <Button
      v-if="!confirmDeletion"
      variant="ghost"
      size="sm"
      :disabled="!checkedIds?.length"
      @click="confirmDeletion = true"
    >
      Delete
    </Button>
    <div v-else class="mr-2 flex items-center">
      Delete selected items?
      <Button
        variant="ghost"
        size="sm"
        text @click="deleteItems"
      >
        Yes
      </Button>
      <span> / </span>
      <Button
        variant="ghost"
        size="sm"
        @click="confirmDeletion = false"
      >
        No
      </Button>
    </div>

    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          :disabled="!checkedIds?.length"
        >
          + Add tags
        </Button>
      </PopoverTrigger>
      <PopoverContent
        class="min-w-min min-h-min p-0"
      >
        <Add
          :ids="checkedIds || []"
          @update="onTagsUpdate"
        />
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          :disabled="!checkedIds?.length"
        >
          - Remove tags
        </Button>
      </PopoverTrigger>
      <PopoverContent
        class="min-w-min min-h-min p-0"
      >
        <Remove
          :ids="checkedIds || []"
          :items="items"
          @update="onTagsUpdate"
        />
      </PopoverContent>
    </Popover>
  </div>
</template>
