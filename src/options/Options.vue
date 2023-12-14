<script setup lang="ts">
import { sendMessage } from 'webext-bridge/options'
import { debounce } from 'lodash-es'
import { userName } from '~/logic/storage'
import Items from '~/components/Items.vue'
import { store } from '~/logic/store'

const status = ref('')
const query = ref('')

watch(
  userName,
  (newValue) => {
    status.value = !newValue ? 'username is required' : ''
  },
  { immediate: true },
)

const update = debounce((e: Event) => {
  query.value = (e.target as HTMLInputElement)?.value
}, 100)

async function fetchPosts() {
  if (userName.value) {
    const res = await sendMessage('fetch-saved', { username: userName.value }, 'background')
    store.isFetching = res.isFetching
  }
}
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700">
    <input v-model="userName" class="border border-gray-400 rounded px-2 py-1 mt-2" />

    <div class="mt-4">
      <button class="text-sm px-4 py-1 border border-gray-800" @click="fetchPosts">Fetch</button>
      <div class="mt-2">{{ store.isFetching ? 'fetching...' : status }}</div>
      <div class="mt-2 text-red-600 whitespace-pre-wrap">{{ store.fetchError }}</div>
    </div>

    <div class="mt-4">
      <b class="mr-2">Search:</b>
      <input class="border border-gray-400 rounded px-2 py-1 mt-2" :value="query" @input="update" />
    </div>

    <div class="mt-4">
      <Items :query="query" />
    </div>
  </main>
</template>
