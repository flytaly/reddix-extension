<script setup lang="ts">
import { sendMessage } from 'webext-bridge/options'
import { userName } from '~/logic/storage'
import Items from '~/components/Items.vue'
import { state } from '~/logic/store'
import SearchItems from '~/components/SearchItems.vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { ref, watch } from 'vue'
import { liveQuery } from 'dexie'
import { db } from '~/logic/db'

const status = ref('')

const tags = ref<Record<string, number>>({})

watch(
  userName,
  (newValue) => {
    status.value = !newValue ? 'username is required' : ''
  },
  { immediate: true },
)

async function fetchPosts() {
  if (userName.value) {
    const res = await sendMessage('fetch-saved', { username: userName.value }, 'background')
    state.isFetching = res.isFetching
  }
}

watch(userName, () => {
  if (state.fetchError) state.fetchError = ''
})

const tagsObs = liveQuery(() =>
  db.savedItems.orderBy('_tags').keys((keys) => {
    const count = {} as Record<string, number>
    keys.forEach((key) => {
      const k = key.toString()
      count[k] = (count[k] || 0) + 1
    })
    return count
  }),
)

tagsObs.subscribe((res) => {
  tags.value = res
})
</script>

<template>
  <main class="grid min-h-screen grid-cols-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light">
    <aside class="mr-auto max-w-52 p-4">
      <div class="flex flex-col gap-2">
        <InputText
          v-model="userName"
          type="text"
          size="small"
          placeholder="username"
          :disabled="state.isFetching"
          :class="{ error: status || state.fetchError }"
        />
        <small class="text-xs text-red-600 dark:text-red-300">{{ status || state.fetchError }}</small>
      </div>
      <div class="mt-2">
        <Button
          class="text-primary-700 dark:text-primary-400"
          size="small"
          text
          label="Sync saved items"
          :disabled="state.isFetching"
          @click="fetchPosts"
        >
          <div class="flex w-full gap-1">
            <pixelarticons-sync />
            <span>{{ state.isFetching ? 'fetching...' : 'Fetch saved items' }}</span>
          </div>
        </Button>
      </div>
      <div class="mt-8 flex flex-col gap-1 text-sm text-surface-500 dark:text-surface-400">
        <h2>Tags:</h2>
        <ul>
          <li v-for="tag in Object.keys(tags)" :key="tag">#{{ tag }} - {{ tags[tag] }}</li>
        </ul>
      </div>
    </aside>
    <div class="flex flex-col items-center p-4">
      <SearchItems />
      <div class="mt-4">
        <Items />
      </div>
    </div>
  </main>
</template>

<style lang="postcss">
main {
  /* Prevent layout shift caused by scrollbar */
  margin-right: calc(-1 * (100vw - 100%));
  overflow-x: hidden;
}
.error {
  @apply ring-red-600 dark:ring-red-300;
}
</style>
