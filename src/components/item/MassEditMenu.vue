<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'

const props = defineProps<{
  items: WrappedItem[]
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
</script>

<template>
  <div class="mb-2 mr-auto flex gap-2 pl-2">
    <TriStateCheckbox
      v-model="selectAll"
      value="select-all"
      name="select-all"
      title="select all"
      aria-label="select all"
    />
    <span class="ml-2"> selected {{ checked?.length || 0 }} / {{ items?.length }} </span>
    <div class="ml-4"></div>
  </div>
</template>

<style lang="postss" scoped></style>
