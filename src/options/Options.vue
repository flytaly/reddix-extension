<script setup lang="ts">
import { sendMessage } from 'webext-bridge/options'
import { userName } from '~/logic/storage'
import Items from '~/components/Items.vue'
import { state } from '~/logic/store'
import SearchItems from '~/components/SearchItems.vue'

const status = ref('')

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
</script>

<template>
  <main class="grid min-h-screen grid-cols-[auto_1fr] text-gray-700">
    <aside class="mr-auto p-4">
      <input v-model="userName" class="mt-2 w-40 rounded border border-gray-400 px-2 py-1" />
      <div class="mt-2">
        <button class="border border-gray-800 px-2 py-1 text-xs" @click="fetchPosts">Fetch saved items</button>
        <div class="mt-2">{{ state.isFetching ? 'fetching...' : status }}</div>
        <div class="mt-2 whitespace-pre-wrap text-red-600">{{ state.fetchError }}</div>
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
