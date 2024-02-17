<script setup lang="ts">
import { requestInfo } from '~/logic/browser-storage'

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
    <div v-if="!isInThePast(requestInfo.rateLimits?.reset)">
      <h3 class="text-sm font-bold">Rate Limits</h3>
      <div class="grid grid-cols-2 gap-x-4">
        <span>used</span>
        <span>{{ requestInfo.rateLimits?.used }}</span>
        <span>remaining</span>
        <span>{{ requestInfo.rateLimits?.remaining }}</span>
        <span>reset at</span>
        <span>{{ formatTime(requestInfo.rateLimits?.reset) }}</span>
      </div>
    </div>
  </article>
</template>
