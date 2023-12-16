<script setup lang="ts">
import { useToggle } from '@vueuse/core'

const [show, toggle] = useToggle(false)
</script>

<template>
  <div class="z-100 leading-1em fixed bottom-0 right-0 m-5 flex select-none items-end font-sans">
    <div
      class="h-min w-max rounded-lg bg-white text-gray-800 shadow"
      p="x-4 y-2"
      m="y-auto r-2"
      transition="opacity duration-300"
      :class="show ? 'opacity-100' : 'opacity-0'"
    >
      <h1 class="text-lg">Vitesse WebExt</h1>
      <SharedSubtitle />
    </div>
    <button
      class="flex h-10 w-10 cursor-pointer rounded-full border-none shadow"
      bg="teal-600 hover:teal-700"
      @click="toggle()"
    >
      <pixelarticons-power class="m-auto block text-lg text-white" />
    </button>
  </div>
</template>
