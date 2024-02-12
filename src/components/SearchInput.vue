<script setup lang="ts">
import { debounce } from 'lodash-es'
import { defineModel } from 'vue'
import { search, setSearchQuery } from '~/logic/search-store'

const postsOn = defineModel<boolean>('postsOn', { default: true })
const commentsOn = defineModel<boolean>('commentsOn', { default: true })

const update = debounce((e: Event) => {
  const query = (e.target as HTMLInputElement)?.value
  setSearchQuery(query)
}, 200)

watch(postsOn, (on) => {
  if (!on && !commentsOn.value) commentsOn.value = true

  search.hidePosts = !postsOn.value
  search.hideComments = !commentsOn.value
})

watch(commentsOn, (on) => {
  if (!on && !postsOn.value) {
    postsOn.value = true
  }
  search.hidePosts = !postsOn.value
  search.hideComments = !commentsOn.value
})

const itemTypes = ['posts', 'comments']
const filterTypes = ref([...itemTypes])

watch(filterTypes, (val) => {
  search.hidePosts = !val.includes('posts')
  search.hideComments = !val.includes('comments')
})

const itemCategories: ItemCategory[] = ['saved', 'upvoted']
const filterCategories = ref([...itemCategories])

watch(filterCategories, (vals) => {
  search.hideSaved = !vals.includes('saved')
  search.hideUpvoted = !vals.includes('upvoted')
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
            root: 'rounded hover:dark:ring-1 dark:ring-sky-900 hover:bg-sky-100 hover:dark:bg-transparent',
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-1 !rounded !text-xs bg-surface-100 dark:border dark:border-surface-700 dark:bg-surface-800',
                {
                  'text-dark/80 dark:text-sky-500 !bg-sky-400/20 dark:border-sky-600 dark:!bg-transparent':
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
            root: 'rounded hover:dark:ring-1 dark:ring-amber-900 hover:bg-amber-100 hover:dark:bg-transparent',
            button: ({ context }) => ({
              class: [
                'm-0.5 !py-0.5 !px-1 !rounded !text-xs bg-surface-100 dark:border dark:border-surface-700 dark:bg-surface-800',
                {
                  'text-dark/70 bg-orange-200/80 dark:!bg-transparent dark:border-amber-500 dark:!text-amber-500':
                    context.active,
                },
              ],
            }),
          }"
          :pt-options="{ mergeProps: true }"
          :options="itemTypes"
          multiple
          aria-labelledby="multiple"
        />
      </div>
      <InputText
        id="search-input"
        :value="search.query"
        placeholder="filter posts and comments"
        autofocus
        @input="update"
      />
    </div>
  </div>
</template>
