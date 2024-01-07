<script setup lang="ts">
import { messages } from '~/logic/log-messages'
</script>

<template>
  <ul>
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
