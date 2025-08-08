<script setup lang="ts">
import Button from '~/components/ui/button/Button.vue'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

interface Item {
  label: string
  command: () => void
}

defineProps<{
  items?: Item[]
  clickHandler?: () => void
}>()
</script>

<template>
  <div class="flex items-center">
    <Button
      variant="outline"
      class="rounded-r-none border-0 bg-transparent dark:bg-transparent hover:bg-primary-100 dark:hover:bg-primary-400/10 font-medium text-accent dark:text-accent hover:text-primary dark:hover:text-primary" size="sm"
      @click="$props.clickHandler"
      v-bind="$attrs"
    >
      <slot />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          class="rounded-l-none border-0 bg-transparent dark:bg-transparent hover:bg-primary-100 dark:hover:bg-primary-400/10 font-medium text-accent dark:text-accent hover:text-primary dark:hover:text-primary"
          size="sm"
        >
          <ph-caret-down class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem v-for="item in $props.items" :key="item.label" @click="item.command">
          {{ item.label }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
