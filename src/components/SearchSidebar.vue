<script setup lang="ts">
import { state, stats } from '~/logic/options-stores'
import AccountInput from '~/components/AccountInputBlock.vue'
import TagList from '~/components/TagList.vue'
import { userName } from '~/logic/storage'
import { sendMessage } from 'webext-bridge/options'
import FetchButton from '~/components/FetchButton.vue'

const visible = ref(false)

async function onSync(category: ItemCategory = 'saved') {
  if (state.isFetching) return
  if (!userName.value || state.fetchError) {
    visible.value = true
    return
  }
  const res = await sendMessage('fetch-items', { username: userName.value, category }, 'background')
  state.isFetching = res.isFetching
}
</script>

<template>
  <div class="relative h-full w-64">
    <aside
      class="absolute mt-4 inset-0 mr-auto hidden h-full max-h-full grid-rows-[auto_auto_1fr] content-start gap-4 overflow-hidden pb-2 md:grid"
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
  <div class="mx-4 flex w-full justify-end px-6 md:hidden">
    <FetchButton :is-fetching="state.isFetching" @fetch-items="onSync" />
    <Sidebar v-model:visible="visible">
      <AccountInput />
    </Sidebar>
  </div>
</template>
