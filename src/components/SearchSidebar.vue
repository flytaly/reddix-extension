<script setup lang="ts">
import Button from 'primevue/button'

import { state, stats } from '~/logic/options-stores'
import AccountInput from '~/components/AccountInputBlock.vue'
import TagList from '~/components/TagList.vue'
import { userName } from '~/logic/storage'
import { sendMessage } from 'webext-bridge/options'

const visible = ref(false)

async function onSync() {
  if (state.isFetching) return
  if (!userName.value || state.fetchError) {
    visible.value = true
    return
  }
  const res = await sendMessage('fetch-saved', { username: userName.value }, 'background')
  state.isFetching = res.isFetching
}
</script>

<template>
  <div class="relative h-full w-64">
    <aside
      class="absolute inset-0 mr-auto hidden h-full max-h-full grid-rows-[auto_auto_1fr] content-start gap-4 overflow-hidden pb-2 md:grid"
    >
      <div class="mx-2 w-60">
        <AccountInput />
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
  <div class="mx-4 flex w-full px-6 md:hidden">
    <Button
      class="ml-auto text-primary-700 dark:text-primary-400"
      size="small"
      text
      label="Sync saved items"
      :disabled="state.isFetching"
      @click="onSync"
    >
      <div class="flex w-full items-center gap-1">
        <PhCloudArrowDownDuotone class="h-4 w-4" />
        <span>{{ state.isFetching ? 'fetching...' : 'Fetch saved items' }}</span>
      </div>
    </Button>
    <Sidebar v-model:visible="visible">
      <AccountInput />
    </Sidebar>
  </div>
</template>
