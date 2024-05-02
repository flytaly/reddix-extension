<script setup lang="ts">
import { useTagsAutocomplete } from '~/composables/useAutocomplete'

type TagList = Array<[string, number]>

const props = defineProps<{
  onExit: (tags: TagList) => any
  onSelect: (tags: TagList) => any
  initialTags: TagList
  forbidNew?: boolean
}>()

const currentTags = ref<TagList>(props.initialTags)

onUnmounted(() => {
  props.onExit(currentTags.value)
})

const { search, completeItems } = useTagsAutocomplete(props.forbidNew)
const target = ref()

async function commit() {
  props.onSelect(currentTags.value)
}

const autocmpRef = ref()

onMounted(() => {
  setTimeout(() => {
    const el = autocmpRef.value.$el as HTMLElement
    if (!el)
      return
    const input = el.querySelector('input')
    if (input)
      input.focus()
  }, 100)
})
</script>

<template>
  <article ref="target">
    <slot name="heading">
      <h2 class="mb-0.5 text-sm">
        Add or remove item tags
      </h2>
    </slot>
    <div class="card flex justify-center">
      <AutoComplete
        ref="autocmpRef"
        v-model="currentTags"
        multiple
        dropdown
        auto-option-focus
        :suggestions="completeItems"
        :complete-on-focus="true"
        :delay="200"
        class="max-w-[32rem]"
        @complete="search"
        @item-select="commit"
        @item-unselect="commit"
      >
        <template #chip="slotProps">
          <span class="max-w-48 break-all"> #{{ slotProps.value[0] }} </span>
        </template>
        <template #option="slotProps">
          <div class="flex max-w-48 justify-between gap-2 break-all">
            <div>#{{ slotProps.option[0] }}</div>
            <div class="ml-auto text-surface-400 dark:text-surface-500">
              {{ slotProps.option[1] || 'new' }}
            </div>
          </div>
        </template>
      </AutoComplete>
    </div>
  </article>
</template>
