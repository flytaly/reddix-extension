<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import AddTagsToItems from '~/components/tags/AddTagsToItems.vue'
import RemoveTagsToItems from '~/components/tags/RemoveTagsToItems.vue'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'

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

const tagsOverlayRef = ref()
const tagsAction = ref<'add' | 'remove'>('add')

const selectedItems = shallowRef<WrappedItem[]>([])
function toggleAddTags(event: Event) {
  selectedItems.value = props.items.filter(it => checkedIds.value?.includes(it.dbId))
  tagsAction.value = 'add'
  tagsOverlayRef.value.toggle(event)
}
function toggleRemoveTags(event: Event) {
  selectedItems.value = props.items.filter(it => checkedIds.value?.includes(it.dbId))
  tagsAction.value = 'remove'
  tagsOverlayRef.value.toggle(event)
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
    <Button
      variant="ghost"
      size="sm"
      :disabled="!checkedIds?.length"
      @click="toggleAddTags"
    >
      + Add tags
    </Button>
    <Button
      variant="ghost"
      size="sm"
      :disabled="!checkedIds?.length"
      @click="toggleRemoveTags"
    >
      - Remove tags
    </Button>
  </div>
  <OverlayPanel ref="tagsOverlayRef" class="px-0 py-0" pt:content:class="p-2">
    <AddTagsToItems v-if="tagsAction === 'add' && selectedItems" :items="selectedItems" @exit="onTagsUpdate" />
    <RemoveTagsToItems
      v-else-if="tagsAction === 'remove' && selectedItems"
      :items="selectedItems"
      @exit="onTagsUpdate"
    />
  </OverlayPanel>
</template>
