<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = defineProps<{
  name: string
  address: string
}>()

const { copy, copied } = useClipboard({ source: props.address })

const showQR = ref(false)
</script>

<template>
  <b class="mb-1 text-sm">{{ name }}</b>
  <div class="rounded-sm border border-surface-400 px-1 py-1 text-sm dark:border-surface-600">
    <div class="flex items-center">
      <span class="mr-4 break-all">{{ address }}</span>
      <button class="btn ml-auto flex-shrink-0" title="copy the address" @click="copy(address)">
        <ph-copy-simple-light v-if="!copied" class="h-5 w-5" />
        <ph-check-fat-duotone v-else class="h-5 w-5 text-green-700 dark:text-green-300" />
      </button>
      <button class="btn ml-1 h-5 w-5" title="show QR code" @click="showQR = !showQR">
        <ph-qr-code class="h-full w-full" />
      </button>
    </div>
    <div v-if="showQR" class="flex justify-center transition-all duration-700">
      <span class="h-56 w-56">
        <slot name="qr" />
      </span>
    </div>
  </div>
</template>
