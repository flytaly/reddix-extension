<script setup lang="ts">
import { debounce } from 'lodash-es'
import { defineModel } from 'vue'
import { search, setSearchQuery } from '~/logic/search-store'
import TextInput from 'primevue/inputtext'

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
</script>

<template>
  <div class="mt-4 w-full max-w-[40rem] p-2">
    <div class="flex flex-col">
      <label for="search-input">
        <b class="mr-2 font-mono text-xl font-semibold text-primary-600 dark:text-primary-400">Search</b>
      </label>
      <TextInput
        id="search-input"
        :value="search.query"
        placeholder="filter posts and comments"
        autofocus
        @input="update"
      />
      <div class="mt-2 flex items-center gap-2">
        <label class="tag-toggle" :class="{ 'tag-toggle-off': !postsOn }">
          <input v-model="postsOn" type="checkbox" class="h-0 w-0" />
          <span>Posts</span>
        </label>
        <label class="tag-toggle" :class="{ 'tag-toggle-off': !commentsOn }">
          <input v-model="commentsOn" type="checkbox" class="h-0 w-0" />
          <span>Comments</span>
        </label>
      </div>
    </div>
  </div>
</template>
