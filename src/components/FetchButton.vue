<script setup lang="ts">
import SplitButton from '~/components/ui/SplitButton.vue'

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
    <SplitButton
      :items="items"
      :disabled="isFetching"
      :click-handler="() => onFetchItems('saved', false)"
    >
      <PhCloudArrowDownDuotone class="h-4 w-4 text-primary-600 dark:text-primary-500" />
      {{ isFetching ? 'fetching...' : 'Get new saved items' }}
    </SplitButton>
  </div>
</template>
