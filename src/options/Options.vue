<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { setupStatsStore, state } from '~/logic/options-stores'

const toast = useToast()

let subscription = setupStatsStore()

const visible = ref(false)

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})

function addToast() {
  visible.value = true
  toast.add({ summary: 'Synchronization', detail: '', group: 'headless' })
}

function clear() {
  visible.value = false
  toast.removeGroup('headless')
}

watch(
  () => state.isFetching,
  (newValue, oldValue) => {
    if (newValue) {
      if (!oldValue && !visible.value) addToast()
      return
    }

    if (oldValue && !visible.value) {
      addToast()
    }
    setTimeout(() => {
      clear()
    }, 1500)
  },
)

watch(
  () => state.fetchError,
  (err) => {
    if (err) {
      toast.add({ severity: 'error', summary: 'Fetch Error', detail: err, life: 3000 })
    }
  },
)
</script>

<template>
  <Toast />
  <Toast position="top-left" group="headless" @close="visible = false">
    <template #container="{ message, closeCallback }">
      <section class="grid w-full grid-cols-[auto_1fr] gap-3 rounded-xl p-3">
        <PhCloudArrowDownDuotone class="h-5 w-5" />
        <div class="flex w-full flex-col gap-3">
          <p class="m-0 text-base font-semibold text-white">{{ message.summary }}</p>
          <p class="text-700 m-0 text-base">{{ message.detail }}</p>
          <div class="flex w-full flex-col gap-2">
            <ProgressBar v-if="state.isFetching" mode="indeterminate" class="h-1 w-full"></ProgressBar>
            <span v-if="state.isFetching" class="ml-auto text-xs">
              <span> loaded {{ state.loaded }} items </span>
              <span v-if="state.savedNew"> ({{ state.savedNew }} new) </span>
            </span>
            <span v-if="!state.isFetching" class="ml-auto text-xs">
              <span>Complete. Loaded {{ state.loaded }} items ({{ state.savedNew }} new).</span>
            </span>
          </div>
          <div class="mb-3 flex gap-3">
            <Button label="Cancel" text class="px-2 py-1" @click="closeCallback">Hide</Button>
          </div>
        </div>
      </section>
    </template>
  </Toast>
  <router-view></router-view>
</template>
