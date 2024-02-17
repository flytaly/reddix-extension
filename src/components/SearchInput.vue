<script setup lang="ts">
import { debounce } from 'lodash-es'
import { memo } from '~/logic/browser-storage'
import { search, setSearchQuery } from '~/logic/search-store'

const update = debounce((e: Event) => {
  const query = (e.target as HTMLInputElement)?.value
  setSearchQuery(query)
}, 200)

const itemTypes: { name: string; value: ItemType }[] = [
  { name: 'posts', value: 'post' },
  { name: 'comments', value: 'comment' },
]

const filterTypes = ref([...itemTypes])

watch(
  () => memo.value.itemTypes,
  (newVal) => {
    filterTypes.value = itemTypes.filter((v) => newVal.includes(v.value))
  },
  { immediate: false, once: true },
)

watch(filterTypes, (val) => {
  search.hidePosts = !val.find((v) => v.value === 'post')
  search.hideComments = !val.find((v) => v.value === 'comment')
  memo.value.itemTypes = val.map((v) => v.value)
})

const itemCategories: ItemCategory[] = ['saved', 'upvoted']
const filterCategories = ref([...itemCategories])

watch(
  () => memo.value.categories,
  (newVal) => {
    filterCategories.value = itemCategories.filter((v) => newVal.includes(v))
  },
  { immediate: false, once: true },
)

watch(filterCategories, (vals) => {
  search.hideSaved = !vals.includes('saved')
  search.hideUpvoted = !vals.includes('upvoted')
  memo.value.categories = vals
})
</script>

<template>
  <div class="w-full max-w-main-column">
    <div class="flex flex-col">
      <div class="mt-2 flex items-center gap-8">
        <label for="search-input">
          <h2 class="mr-2 font-mono text-xl font-semibold text-primary-600 dark:text-primary-400">Search</h2>
        </label>
        <SelectButton
          v-model="filterCategories"
          :pt="{
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-1 !rounded !text-xs text-dark/60 dark:text-light/60 bg-surface-100 border border-surface-300 dark:border-surface-700 dark:bg-surface-800',
                {
                  'text-dark/80 dark:!text-sky-500 !bg-sky-400/20 dark:!bg-transparent !border-sky-200 dark:!border-sky-600 hover:dark:!bg-sky-950':
                    context.active,
                },
              ],
            }),
          }"
          :pt-options="{ mergeProps: true }"
          :options="itemCategories"
          multiple
          aria-labelledby="multiple"
        />
        <SelectButton
          v-model="filterTypes"
          :pt="{
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-1 !rounded !text-xs text-dark/60 dark:text-light/60 bg-surface-100 border border-surface-300 dark:border-surface-700 dark:bg-surface-800',
                {
                  '!text-dark/80 dark:!text-amber-500 !bg-orange-200/80 dark:!bg-transparent !border-orange-200 dark:!border-amber-500 hover:dark:!bg-amber-950':
                    context.active,
                },
              ],
            }),
          }"
          :pt-options="{ mergeProps: true }"
          :options="itemTypes"
          option-label="name"
          multiple
          aria-labelledby="multiple"
        />
      </div>
      <InputText
        id="search-input"
        :value="search.query"
        placeholder="filter posts and comments"
        :size="$app.context === 'popup' ? 'small' : undefined"
        autofocus
        @input="update"
      />
    </div>
  </div>
</template>
