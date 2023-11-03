<script setup lang="ts">
import { getPosts } from '~/reddit'
import { userName } from '~/logic/storage'

const status = ref('')
const isFetching = ref(false)
const error = ref('')

watch(
  userName,
  (newValue) => {
    status.value = !newValue ? 'username is required' : 'ok'
  },
  { immediate: true },
)

async function fetchPosts() {
  if (isFetching.value) {
    return
  }
  isFetching.value = true
  const [_, errMsg] = await getPosts(userName.value)
  if (errMsg) {
    error.value = errMsg
  }
  isFetching.value = false
}
</script>

<template>
  <main class="px-4 py-10 text-center text-gray-700">
    <SharedSubtitle />

    <input v-model="userName" class="border border-gray-400 rounded px-2 py-1 mt-2" />

    <div class="mt-4">
      <button class="text-sm px-4 py-1 border border-gray-800" @click="fetchPosts">Fetch</button>
      <div class="mt-2">{{ isFetching ? 'fetching...' : status }}</div>
      <div class="mt-2 text-red-600 whitespace-pre-wrap">{{ error }}</div>
    </div>
  </main>
</template>
