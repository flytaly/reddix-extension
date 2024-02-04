<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  items: WrappedItem[]
  hasMore: boolean
  onLoadAll: () => Promise<void>
  onDelete: (ids: number[]) => Promise<void>
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
</script>

<template>
  <div class="mb-2 mr-auto flex gap-2 pl-2">
    <TriStateCheckbox v-model="selectAll" title="select all" aria-label="select all" />
    <span class="ml-2"> selected {{ checked?.length || 0 }} / {{ items?.length }}</span>
    <slot> </slot>
    <button
      v-if="!confirmDeletion"
      class="flex gap-0 underline decoration-dashed underline-offset-2 disabled:text-surface-500"
      :disabled="!checked?.length"
      @click="confirmDeletion = true"
    >
      Delete
    </button>
    <div v-else class="mr-2">
      Delete selected items?
      <button @click="deleteItems">Yes</button>
      <span> / </span>
      <button @click="confirmDeletion = false">No</button>
    </div>
  </div>
</template>

<style lang="postss" scoped></style>
