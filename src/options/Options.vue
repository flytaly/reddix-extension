<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Toaster } from '~/components/ui/sonner'
import { setupMessageHandlers, setupStatsStore, state } from '~/logic/stores'

const subscription = setupStatsStore()

onMounted(async () => {
  setupMessageHandlers()
})

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})

watch(
  () => state.isFetching,
  (newValue) => {
    if (newValue) {
      return toast.info('Synchronization started', { position: 'top-left' })
    }
    if (!state.fetchError) {
      toast.info('Synchronization is completed', {
        description: `Loaded ${state.loaded} items (${state.savedNew} new)`,
        position: 'top-left',
      })
    }
  },
)

watch(
  () => state.fetchError,
  (err) => {
    if (err)
      toast.error(`Fetch Error`, { description: err, position: 'top-left' })
  },
)
</script>

<template>
  <Toaster
    close-button
    position="top-right"
  />
  <router-view />
</template>
