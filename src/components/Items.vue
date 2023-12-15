<script setup lang="ts">
import { SavedRedditItem, db, find } from '~/logic/db'
import { store } from '~/logic/store'
import type { RedditItem } from '~/reddit/reddit-types'
import ItemList from '~/components/ItemList.vue'
import { ITEMS_ON_PAGE } from '~/constants'

const props = defineProps<{ query: string }>()

const offset = ref(0)
const isEnd = ref(false)
const items = ref<RedditItem[]>()

function onNewItems(incoming: SavedRedditItem[], limit: number) {
  isEnd.value = incoming.length < limit
  if (offset.value === 0 || !items.value?.length) {
    items.value = incoming
    return
  }
  items.value = [...items.value, ...incoming]
}

async function getPostsFromDB(query?: string, offset = 0, limit = ITEMS_ON_PAGE) {
  // TODO: handle errors
  if (!query) {
    const res = await db.savedItems.offset(offset).limit(limit).toArray()
    return onNewItems(res, limit)
  }
  const res = await find(
    query.split(' ').map((s) => s.toLowerCase().trim()),
    { limit, offset },
  )
  return onNewItems(res, limit)
}

watch(
  () => store.isFetching,
  (isFetching) => {
    if (isFetching) return

    getPostsFromDB(props.query, offset.value)
  },
  { immediate: true },
)

watch(props, async (newValue) => {
  getPostsFromDB(newValue.query, 0, offset.value + ITEMS_ON_PAGE)
  offset.value = 0
})

watch(offset, () => {
  getPostsFromDB(props.query, offset.value)
})
</script>

<template>
  <h2>Posts:</h2>
  <div class="flex flex-col items-center justify-center">
    <ItemList :items="items" />
    <button v-if="!isEnd" class="p-2 py-4" @click="offset += ITEMS_ON_PAGE">Load more</button>
  </div>
</template>
