<script setup lang="ts">
import { useFilter } from 'reka-ui'
import { computed, ref } from 'vue'
import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxList } from '~/components/ui/combobox'
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from '~/components/ui/tags-input'

const { onSelect, tagList = [] } = defineProps<{
  onSelect?: (update: string[]) => void
  tagList?: TagList
}>()

type TagList = Array<[string, number]>
const modelValue = ref<string[]>([])
const inputTerm = ref('')

watch(modelValue.value, (update) => {
  onSelect?.(update)
})

const { contains } = useFilter({ sensitivity: 'base' })

const filtered = computed(() => {
  let cmp = tagList.filter(i => !modelValue.value.includes(i[0]))

  if (!inputTerm.value) {
    return cmp
  }

  cmp = cmp.filter(option => contains(option[0], inputTerm.value))
  if (cmp.length > 0 && cmp[0][0] === inputTerm.value) {
    return cmp
  }
  cmp.push([inputTerm.value, 0])
  return cmp
})
</script>

<template>
  <Combobox
    v-model="modelValue"
    :ignore-filter="true"
    open-on-focus
  >
    <ComboboxAnchor as-child>
      <TagsInput v-model="modelValue" class="px-2 gap-2 w-80">
        <div class="flex gap-2 flex-wrap items-center">
          <TagsInputItem
            v-for="item in modelValue"
            :key="item"
            :value="item"
          >
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
        </div>

        <ComboboxInput v-model="inputTerm" as-child>
          <TagsInputInput
            placeholder="Add a tag"
            class="w-full p-0 border-none focus-visible:ring-0 h-auto"
            @keydown.enter.prevent
          />
        </ComboboxInput>
      </TagsInput>
    </ComboboxAnchor>

    <ComboboxList
      class="w-(--reka-popper-anchor-width)"
    >
      <ComboboxEmpty>No tags</ComboboxEmpty>

      <ComboboxGroup>
        <ComboboxItem
          v-for="tag in filtered"
          :key="tag[0]"
          :value="tag[0]"
          class="group"
          @select.prevent="(ev) => {
            if (typeof ev.detail.value === 'string') {
              inputTerm = ''
              modelValue.push(ev.detail.value)
            }
          }"
        >
          <div class="flex w-full justify-between gap-2 break-all">
            <div>#{{ tag[0] }}</div>
            <div class="ml-auto not-group-data-[highlighted]:text-muted-foreground">
              {{ tag[1] || 'new' }}
            </div>
          </div>
        </ComboboxItem>
      </ComboboxGroup>
    </ComboboxList>
  </Combobox>
</template>
