<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import AddTagsToItems from '~/components/tags/AddTagsToItems.vue'
import RemoveTagsToItems from '~/components/tags/RemoveTagsToItems.vue'

const props = defineProps<{
  items: WrappedItem[]
  onLoadAll: () => Promise<void>
  onDelete: (ids: number[]) => Promise<void>
  onTagsUpdate: (updated: Record<number, string[]>) => void
}>()

const checked = defineModel<number[]>()

const selectAll = ref<true | false | null>(null)

watch(selectAll, (val) => {
  const len = checked.value?.length || 0
  if ((val === null && len) || (val === false && len === props.items.length)) {
    checked.value = []
  } else if (val && len != props.items.length) {
    checked.value = props.items.map((it) => it.dbId)
  }
})

watch(checked, (val) => {
  const len = val?.length || 0
  if (len == 0 && selectAll.value !== null) {
    selectAll.value = null
  } else if (len == props.items.length && !selectAll.value) {
    selectAll.value = true
  } else if (len > 0 && len < props.items.length && selectAll.value !== false) {
    selectAll.value = false
  }
})

const confirmDeletion = ref(false)

const deleteItems = async () => {
  await props.onDelete(checked.value || [])
  checked.value = []
  confirmDeletion.value = false
}

const tagsOverlayRef = ref()
const tagsAction = ref<'add' | 'remove'>('add')

const selectedItems = shallowRef<WrappedItem[]>([])
const toggleAddTags = (event: Event) => {
  selectedItems.value = props.items.filter((it) => checked.value?.includes(it.dbId))
  tagsAction.value = 'add'
  tagsOverlayRef.value.toggle(event)
}
const toggleRemoveTags = (event: Event) => {
  selectedItems.value = props.items.filter((it) => checked.value?.includes(it.dbId))
  tagsAction.value = 'remove'
  tagsOverlayRef.value.toggle(event)
}
</script>

<template>
  <div class="mx-auto mb-2 mr-auto flex w-full max-w-main-column flex-wrap items-center gap-x-2 px-2 pl-2">
    <TriStateCheckbox v-model="selectAll" title="select all" aria-label="select all" />
    <span class="ml-2"> selected {{ checked?.length || 0 }} / {{ items?.length }}</span>
    <slot />
    <Button
      v-if="!confirmDeletion"
      text
      class="flex min-w-max gap-0 px-2 underline decoration-dashed underline-offset-2 disabled:text-surface-500"
      :disabled="!checked?.length"
      @click="confirmDeletion = true"
    >
      Delete
    </Button>
    <div v-else class="mr-2 flex items-center">
      Delete selected items?
      <Button text @click="deleteItems">Yes</Button>
      <span> / </span>
      <Button text @click="confirmDeletion = false">No</Button>
    </div>
    <Button
      text
      class="flex min-w-max gap-0 px-2 underline decoration-dashed underline-offset-2 disabled:text-surface-500"
      :disabled="!checked?.length"
      @click="toggleAddTags"
    >
      + Add tags
    </Button>
    <Button
      text
      class="flex min-w-max gap-0 px-2 underline decoration-dashed underline-offset-2 disabled:text-surface-500"
      :disabled="!checked?.length"
      @click="toggleRemoveTags"
    >
      - Remove tags
    </Button>
  </div>
  <OverlayPanel ref="tagsOverlayRef" class="px-0 py-0" :pt="{ content: 'p-2' }">
    <AddTagsToItems v-if="tagsAction === 'add' && selectedItems" :items="selectedItems" @exit="onTagsUpdate" />
    <RemoveTagsToItems
      v-else-if="tagsAction === 'remove' && selectedItems"
      :items="selectedItems"
      @exit="onTagsUpdate"
    />
  </OverlayPanel>
</template>

<style lang="postss" scoped></style>
