<script setup lang="ts">
const props = defineProps<{
  isFetching?: boolean
  onFetchItems: (category: ItemCategory) => void
}>()

const items = [
  {
    label: 'Fetch upvoted items',
    command: () => {
      props.onFetchItems('upvoted')
    },
  },
]
</script>

<template>
  <div class="flex items-center">
    <PhCloudArrowDownDuotone class="h-4 w-4 text-primary-600 dark:text-primary-500" />
    <SplitButton
      text
      :label="isFetching ? 'fetching...' : 'Fetch saved items'"
      size="small"
      :model="items"
      :disabled="isFetching"
      @click="() => onFetchItems('saved')"
    >
    </SplitButton>
  </div>
</template>
