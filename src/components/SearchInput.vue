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

const options = ['Posts', 'Comments']

const filter = ref([...options])

watch(filter, (newVal) => {
  search.hidePosts = !newVal.includes('Posts')
  search.hideComments = !newVal.includes('Comments')
})
</script>

<template>
  <div class="w-full max-w-main-column">
    <div class="flex flex-col">
      <label for="search-input">
        <h2 class="mr-2 font-mono text-xl font-semibold text-primary-600 dark:text-primary-400">Search</h2>
      </label>
      <InputText
        id="search-input"
        :value="search.query"
        placeholder="filter posts and comments"
        autofocus
        @input="update"
      />
      <div class="mt-2 flex items-center gap-2">
        <div class="card flex justify-center">
          <SelectButton
            v-model="filter"
            :pt="{
              root: 'rounded hover:bg-surface-300 dark:hover:bg-surface-700',
              button: ({ context }) => ({
                class: [
                  'm-0.5 !py-0.5 !px-1 !rounded !text-xs bg-surface-100 dark:bg-surface-800',
                  { 'text-dark dark:text-light !bg-primary-200 dark:!bg-primary-700': context.active },
                ],
              }),
            }"
            :pt-options="{ mergeProps: true }"
            :options="options"
            multiple
            aria-labelledby="multiple"
          />
        </div>
      </div>
    </div>
  </div>
</template>
