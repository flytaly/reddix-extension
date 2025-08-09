<script setup lang="ts">
import { debounce } from 'lodash-es'
import SearchHelp from '~/components/help/SearchHelp.vue'
import { Input } from '~/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { inputsStorage } from '~/logic/browser-storage'

import { clearSearch, search, setSearchQuery } from '~/logic/search-store'

const inputQuery = ref(search.query)

watch(search, query => (inputQuery.value = query.query))

const update = debounce((e: Event) => {
  const query = (e.target as HTMLInputElement)?.value
  setSearchQuery(query)
}, 200)

const itemTypes = ['post', 'comment'] as ItemType[]
const filterItemType = ref(itemTypes.filter(v => inputsStorage.value.itemTypes.includes(v)))
const itemCategories: ItemCategory[] = ['saved', 'upvoted']
const filterCategories = ref(itemCategories.filter(v => inputsStorage.value.categories.includes(v)))

watch(filterItemType, (vals) => {
  search.hidePosts = !vals.includes('post')
  search.hideComments = !vals.includes('comment')
  inputsStorage.value.itemTypes = [...vals]
}, { immediate: true })

watch(filterCategories, (vals) => {
  search.hideSaved = !vals.includes('saved')
  search.hideUpvoted = !vals.includes('upvoted')
  inputsStorage.value.categories = [...vals]
}, { immediate: true })

function clear() {
  clearSearch()
}

const badgeClasses = {
  base: 'h-auto min-w-min m-0.5 py-0.5! px-0.5! xs:px-1! rounded-sm! text-xs! text-dark/60 dark:text-light/60 bg-surface-100 border! border-surface-300 dark:border-surface-700 dark:bg-surface-800',
  activeCategory: 'text-dark/80! dark:text-sky-500! bg-sky-400/20! dark:bg-transparent border-sky-200! dark:border-sky-600! dark:hover:bg-sky-950!',
  activeItemType: 'text-dark/80! dark:text-amber-500! bg-orange-200/80! dark:bg-transparent! border-orange-200! dark:border-amber-500! dark:hover:bg-amber-950!',
} as const

const badgeLabels = { saved: 'saved', upvoted: 'upvoted', post: 'posts', comment: 'comments' }
</script>

<template>
  <div class="w-full max-w-main-column">
    <div class="flex flex-col">
      <div class="mt-2 flex items-center gap-2 xs:gap-8">
        <label for="search-input" class="mr-0.5 flex items-center gap-1 xs:mr-2">
          <h2 class="font-mono text-xl font-semibold text-primary-600 dark:text-primary-400">Search</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <ph-info class="h-5 w-5 text-surface-500" />
              </TooltipTrigger>
              <TooltipContent
                :side="$app.context === 'popup' ? 'bottom' : 'right'"
                class="max-w-[min(90vw,650px)] text-xs xs:text-sm bg-popover text-popover-foreground shadow"
              >
                <SearchHelp />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </label>
        <ToggleGroup v-model="filterCategories" type="multiple">
          <ToggleGroupItem
            v-for="value in itemCategories"
            :key="value"
            :value="value"
            :class="[
              badgeClasses.base,
              filterCategories.includes(value) && badgeClasses.activeCategory,
            ]"
          >
            {{ badgeLabels[value] }}
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup v-model="filterItemType" type="multiple">
          <ToggleGroupItem
            v-for="value in itemTypes"
            :key="value"
            :value="value"
            :class="[
              badgeClasses.base,
              filterItemType.includes(value) && badgeClasses.activeItemType,
            ]"
          >
            {{ badgeLabels[value] }}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div class="w-full relative">
        <Input
          id="search-input"
          v-model="inputQuery"
          class="w-full pr-5 focus-visible:ring-0"
          :class="{ 'h-7': $app.context === 'popup' }"
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
