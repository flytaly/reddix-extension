<script setup lang="ts">
import { reqInfoStorage } from '~/logic/browser-storage'

function isInThePast(ts?: number | null) {
  if (!ts) return true
  return ts < Date.now()
}

function formatTime(ts?: number | null) {
  if (!ts) return 'N/A'
  const d = new Date(ts)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}
</script>

<template>
  <article class="mt-4 hidden text-xs sm:block">
    <div v-if="!isInThePast(reqInfoStorage.rateLimits?.reset)">
      <h3 class="text-sm font-bold">Rate Limits</h3>
      <div class="grid grid-cols-2 gap-x-4">
        <span>used</span>
        <span>{{ reqInfoStorage.rateLimits?.used }}</span>
        <span>remaining</span>
        <span>{{ reqInfoStorage.rateLimits?.remaining }}</span>
        <span>reset at</span>
        <span>{{ formatTime(reqInfoStorage.rateLimits?.reset) }}</span>
      </div>
    </div>
  </article>
</template>
