<script setup lang="ts">
import { watch } from 'vue'

import { userName } from '~/logic/storage'
import { state } from '~/logic/store'
import { getTagsArray } from '~/logic/store'
import { setTag } from '~/logic/search-store'
import { requestInfo } from '~/logic/storage'
import AccountInput from '~/components/AccountInputBlock.vue'

watch(userName, () => {
  if (state.fetchError) state.fetchError = ''
})

async function onTagClick(e: MouseEvent) {
  const tag = (e.currentTarget as HTMLElement).dataset.tag
  if (!tag) return
  setTag(tag)
}

function formatTime(ts?: number | null) {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

function isInThePast(ts?: number | null) {
  if (!ts) return true
  return ts < Date.now()
}
</script>

<template>
  <aside class="mr-auto p-4">
    <AccountInput />
    <article class="mt-4 text-xs">
      <div v-if="!isInThePast(requestInfo.rateLimits?.reset)">
        <h2 class="text-sm font-bold">Rate Limits</h2>
        <div class="grid grid-cols-2 gap-x-4">
          <span>used</span>
          <span>{{ requestInfo.rateLimits?.used }}</span>
          <span>remaining</span>
          <span>{{ requestInfo.rateLimits?.remaining }}</span>
          <span>reset at</span>
          <span>{{ formatTime(requestInfo.rateLimits?.reset) }}</span>
        </div>
      </div>
    </article>
    <article class="mt-4 flex flex-col gap-1 py-2 text-sm">
      <h2 class="font-bold">Tags</h2>
      <ul>
        <li v-for="[tag, count] in getTagsArray()" :key="tag">
          <a
            href="#"
            class="flex justify-between gap-2 overflow-hidden text-ellipsis whitespace-pre text-surface-500 dark:text-surface-400"
            :data-tag="tag"
            @click.prevent="onTagClick"
          >
            <span>#{{ tag }}</span>
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
  min-height: 100vh;
  grid-template-rows: auto auto 1fr;
  align-content: start;
}
</style>
