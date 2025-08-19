<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
    }"
    :toast-options="{
      unstyled: true,
      classes: {
        toast: 'text-popover-foreground grid grid-cols-[auto_1fr] gap-1 bg-popover relative p-2 ring rounded-md shadow text-xs',
        title: 'text-sm font-semibold',
        closeButton: 'p-0.25 absolute ring bg-popover hover:text-popover-foreground rounded-full -right-2.5 -top-2.5 [&_svg]:w-4 [&_svg]:h-4',
        info: 'text-blue-800! bg-blue-50! dark:text-blue-200! dark:bg-popover!',
        error: 'text-red-700! bg-red-50! dark:text-red-300! dark:bg-popover!',
      },
    }"
  />
</template>
