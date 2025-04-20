<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'

import AccountInput from '~/components/AccountInputBlock.vue'
import FetchButton from '~/components/FetchButton.vue'
import TagList from '~/components/TagList.vue'
import { userName } from '~/logic/browser-storage'
import { state, stats } from '~/logic/stores'
import { sendMessage } from '~/messages'

const visible = ref(false)

async function onSync(category: ItemCategory = 'saved', fetchAll = false) {
  if (state.isFetching)
    return
  if (!userName.value || state.fetchError) {
    visible.value = true
    return
  }
  const res = await sendMessage('fetch-items', { username: userName.value, category, options: { fetchAll } })
  state.isFetching = res.isFetching
}

const route = useRoute()
const router = useRouter()

const fetchOnStart = ref(false)

// watch media query programmatically to not render sidebar
const isLargeScreen = useMediaQuery('(min-width: 960px)')

onMounted(() => {
  setTimeout(() => {
    if (route.hash === '#fetch') {
      fetchOnStart.value = true
      visible.value = true
      router.replace({ hash: '' })
    }
    // wait for username to be set from storage
  }, 200)
})
</script>

<template>
  <div class="relative h-full w-64">
    <aside
      v-if="isLargeScreen"
      class="absolute inset-0 mr-auto mt-4 grid h-full max-h-full grid-rows-[auto_auto_1fr] content-start gap-4 overflow-hidden pb-2"
    >
      <div class="mx-2 w-60">
        <AccountInput :start-fetching="fetchOnStart" />
      </div>
      <div class="mx-2 w-60">
        <div class="mt-2 flex justify-between text-surface-500 dark:text-surface-400">
          <span>Items in DB </span>
          <span>{{ stats.total }}</span>
        </div>
      </div>
      <TagList />
    </aside>
  </div>
  <div v-if="!isLargeScreen" class="flex w-full justify-end px-6">
    <FetchButton :is-fetching="state.isFetching" @fetch-items="onSync" />
    <Sidebar v-model:visible="visible">
      <AccountInput :start-fetching="fetchOnStart" />
    </Sidebar>
  </div>
</template>
