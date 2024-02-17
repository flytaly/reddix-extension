<script setup lang="ts">
const props = defineProps<{
  isFetching?: boolean
  onFetchItems: (category: ItemCategory, all: boolean) => void
}>()

const items = [
  {
    label: 'Get upvoted posts',
    command: () => {
      props.onFetchItems('upvoted', false)
    },
  },
  {
    label: 'Refetch all saved items',
    command: () => {
      props.onFetchItems('saved', true)
    },
  },
  {
    label: 'Refetch all upvoted posts',
    command: () => {
      props.onFetchItems('upvoted', true)
    },
  },
]
</script>

<template>
  <div class="flex items-center">
    <PhCloudArrowDownDuotone class="h-4 w-4 text-primary-600 dark:text-primary-500" />
    <SplitButton
      text
      :label="isFetching ? 'fetching...' : 'Get new saved items'"
      size="small"
      :model="items"
      :disabled="isFetching"
      @click="() => onFetchItems('saved', false)"
    >
    </SplitButton>
  </div>
</template>
