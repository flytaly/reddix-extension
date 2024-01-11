<script setup lang="ts">
import { messages } from '~/logic/log-messages'
</script>

<template>
  <ul
    v-if="messages.length > 0"
    class="max-h-96 w-full max-w-xl overflow-auto break-all bg-surface-100 p-2 ring-1 ring-surface-200 dark:bg-surface-900 dark:ring-surface-700"
  >
    <li v-for="msg in messages" :key="msg.id">
      <span class="text-surface-500 dark:text-surface-500">{{ msg.date.toLocaleTimeString() }}</span>
      <span
        class="ml-2"
        :class="{
          'text-error-dark dark:text-error-light': msg.type === 'error',
        }"
      >
        {{ msg.message }}
      </span>
    </li>
  </ul>
</template>

<style lang="postcss"></style>
