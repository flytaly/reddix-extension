<script setup lang="ts">
import { setupStatsStore } from '~/logic/store'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})
</script>

<template>
  <router-view></router-view>
</template>
