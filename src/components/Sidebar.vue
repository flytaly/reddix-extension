<script setup lang="ts">
import { watch } from 'vue'

import { userName } from '~/logic/storage'
import { state } from '~/logic/options-stores'
import { getTagsArray, stats } from '~/logic/options-stores'
import { setTag } from '~/logic/search-store'
import AccountInput from '~/components/AccountInputBlock.vue'

watch(userName, () => {
  if (state.fetchError) state.fetchError = ''
})

async function onTagClick(e: MouseEvent) {
  const tag = (e.currentTarget as HTMLElement).dataset.tag
  if (!tag) return
  setTag(tag)
}
</script>

<template>
  <aside class="mr-auto px-4">
    <AccountInput />
    <div v-if="stats.total" class="mt-2 flex justify-between text-surface-500 dark:text-surface-400">
      <span>Items in DB </span>
      <span>{{ stats.total }}</span>
    </div>
    <article class="mt-2 hidden flex-col gap-1 py-2 text-sm sm:flex">
      <h2 class="font-bold">Tags</h2>
      <ul>
        <li v-for="[tag, count] in getTagsArray()" :key="tag">
          <a
            href="#"
            class="flex justify-between gap-2 whitespace-pre text-surface-500 dark:text-surface-400"
            :data-tag="tag"
            @click.prevent="onTagClick"
          >
            <span class="max-w-52 overflow-hidden text-ellipsis">#{{ tag }}</span>
            <span>{{ count }}</span>
          </a>
        </li>
      </ul>
    </article>
  </aside>
</template>

<style lang="postcss" scoped>
.error {
  @apply ring-red-600 dark:ring-red-300;
}

aside {
  display: grid;
  grid-template-rows: auto auto 1fr;
  align-content: start;
}
</style>
