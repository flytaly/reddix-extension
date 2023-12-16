<script setup lang="ts">
import { debounce } from 'lodash-es'
import { defineModel } from 'vue'

const query = defineModel<string>('query', { required: true })
const postsOn = defineModel<boolean>('postsOn', { default: true })
const commentsOn = defineModel<boolean>('commentsOn', { default: true })

// TODO: use reactive local state to save query and other properties

const update = debounce((e: Event) => {
  query.value = (e.target as HTMLInputElement)?.value
}, 100)

watch(postsOn, (on) => {
  if (!on && !commentsOn.value) commentsOn.value = true
})
watch(commentsOn, (on) => {
  if (!on && !postsOn.value) postsOn.value = true
})
</script>

<template>
  <div class="mt-4 w-full max-w-[40rem] p-2">
    <div class="flex flex-col">
      <b class="mr-2 text-xl font-semibold">Search</b>
      <input class="mt-2 rounded border border-gray-400 px-2 py-1" :value="query" @input="update" />
      <div class="mt-2 flex items-center gap-2">
        <label :class="{ disabled: !postsOn }">
          <input v-model="postsOn" type="checkbox" class="h-0 w-0" />
          <span>Posts</span>
        </label>
        <label :class="{ disabled: !commentsOn }">
          <input v-model="commentsOn" type="checkbox" class="h-0 w-0" />
          <span>Comments</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
label {
  @apply rounded-md bg-gray-600 px-2 py-1 text-gray-100;

  font-weight: 500;
}

label:hover,
label:focus-within {
  @apply text-white;
}

label.disabled:hover,
label.disabled:focus-within {
  @apply text-gray-700;
}

.disabled {
  @apply bg-gray-50 text-gray-400;
}
</style>
