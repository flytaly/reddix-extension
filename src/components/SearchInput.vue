<script setup lang="ts">
import { debounce } from 'lodash-es'

import SearchHelp from '~/components/help/SearchHelp.vue'
import { inputsStorage } from '~/logic/browser-storage'
import { clearSearch, search, setSearchQuery } from '~/logic/search-store'

const update = debounce((e: Event) => {
  const query = (e.target as HTMLInputElement)?.value
  setSearchQuery(query)
}, 200)

const itemTypes: { name: string, value: ItemType }[] = [
  { name: 'posts', value: 'post' },
  { name: 'comments', value: 'comment' },
]

const itemTypesSaved = itemTypes.filter(v => inputsStorage.value.itemTypes.includes(v.value))
const filterTypes = ref(itemTypesSaved)

watch(filterTypes, (val) => {
  search.hidePosts = !val.find(v => v.value === 'post')
  search.hideComments = !val.find(v => v.value === 'comment')
  inputsStorage.value.itemTypes = val.map(v => v.value)
}, { immediate: true })

const itemCategories: ItemCategory[] = ['saved', 'upvoted']
const itemCategoriesSaved = itemCategories.filter(v => inputsStorage.value.categories.includes(v))
const filterCategories = ref(itemCategoriesSaved)

watch(filterCategories, (vals) => {
  search.hideSaved = !vals.includes('saved')
  search.hideUpvoted = !vals.includes('upvoted')
  inputsStorage.value.categories = vals
}, { immediate: true })

const tooltip = ref()

function showTooltip(ev: MouseEvent) {
  tooltip.value.toggle(ev)
}
function hideTooltip(ev: MouseEvent) {
  tooltip.value.hide(ev)
}

function clear() {
  clearSearch()
}
</script>

<template>
  <OverlayPanel ref="tooltip">
    <div class="max-w-screen-sm text-xs xs:text-sm">
      <SearchHelp />
    </div>
  </OverlayPanel>
  <div class="w-full max-w-main-column">
    <div class="flex flex-col">
      <div class="mt-2 flex items-center gap-2 xs:gap-8">
        <label for="search-input" class="mr-0.5 flex items-center gap-1 xs:mr-2">
          <h2 class="font-mono text-xl font-semibold text-primary-600 dark:text-primary-400">Search</h2>
          <div @mouseenter="showTooltip" @mouseleave="hideTooltip">
            <ph-info class="h-5 w-5 text-surface-500" />
          </div>
        </label>
        <SelectButton
          v-model="filterCategories"
          :pt="{
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-0.5 xs:!px-1 !rounded !text-xs text-dark/60 dark:text-light/60 bg-surface-100 border border-surface-300 dark:border-surface-700 dark:bg-surface-800',
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
          title="toggle saved and upvoted items"
        />
        <SelectButton
          v-model="filterTypes"
          :pt="{
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-0.5 xs:!px-1 !rounded !text-xs text-dark/60 dark:text-light/60 bg-surface-100 border border-surface-300 dark:border-surface-700 dark:bg-surface-800',
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
          title="toggle posts and comments"
        />
      </div>
      <div class="w-full relative">
        <InputText
          id="search-input"
          :value="search.query"
          :size="$app.context === 'popup' ? 'small' : undefined"
          class="w-full pr-5"
          placeholder="filter posts and comments"
          autofocus
          @input="update"
        />
        <button v-if="search.query" class="absolute top-1/2 -translate-y-1/2 right-1" title="clear search" @click="clear">
          <PhX class="w-5 h-5 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100" />
        </button>
      </div>
    </div>
  </div>
</template>
