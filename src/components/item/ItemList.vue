<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

import type { SavedRedditItem } from '~/logic/db'
import { setTag, setSubreddit, setAuthor } from '~/logic/search-store'
import ItemCard from '~/components/item/ItemCard.vue'
import { getUserInfo } from '~/reddit/me'
import { unsave } from '~/reddit/unsave'
import { updateItem } from '~/logic/db/mutations'

const props = defineProps<{
  items?: SavedRedditItem[]
  addTags: (e: Event) => void
  onRemove: (ids: number[]) => void
  onUnsave: (id: number) => Promise<void>
  onUpdate: (item: SavedRedditItem) => Promise<void>
}>()

function removeItem(id: number) {
  props.onRemove([id])
}

const toast = useToast()

async function unsaveOnReddit(name: string) {
  const [userInfo, err] = await getUserInfo()
  const modhash = userInfo?.data?.modhash
  if (err || !modhash) {
    toast.add({ severity: 'error', summary: 'Error', detail: err, life: 3000 })
    return
  }
  const unsaveError = await unsave(name, modhash)
  if (unsaveError) {
    toast.add({ severity: 'error', summary: 'Error', detail: unsaveError, life: 3000 })
    return
  }
  let item = props.items?.find((item) => item.name === name)
  if (!item) return
  await updateItem(item._id, { saved: false })
  await props.onUnsave(item._id)
  toast.add({ severity: 'info', summary: 'Info', detail: 'Unsaved the item', life: 1000 })
}
</script>

<template>
  <ol class="mt-4 flex w-full flex-col gap-0 text-left">
    <li v-for="item in items" :key="item.id" :data-reddit-name="item.name" class="flex max-w-full flex-col gap-2">
      <ItemCard
        :item="item"
        @add-tags="addTags"
        @tag-click="setTag"
        @subreddit-click="setSubreddit"
        @author-click="setAuthor"
        @unsave="unsaveOnReddit"
        @remove="removeItem"
        @update="onUpdate"
      />
    </li>
  </ol>
</template>

<style lang="postcss" scoped>
.dimmed-1 {
  @apply text-surface-500 dark:text-surface-400;
}
.dimmed-2 {
  @apply text-surface-400 dark:text-surface-500;
}
.wrap-anywhere {
  overflow-wrap: anywhere;
}
</style>
