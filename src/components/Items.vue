<script setup lang="ts">
import { db, find } from '~/logic/db'
import { store } from '~/logic/store'
import type { RedditItem } from '~/reddit/reddit-types'
import ItemList from '~/components/ItemList.vue'

const props = defineProps({
  query: String,
})

const items = ref<RedditItem[]>()

async function getPostsFromDB(query?: string) {
  // TODO: handle errors
  if (!query) {
    db.savedItems.toArray().then((result) => {
      items.value = result
    })
    return
  }

  const res = await find(query.split(' ').map((s) => s.toLowerCase().trim()))
  items.value = res
}

watch(
  () => store.isFetching,
  (isFetching) => {
    if (!isFetching) {
      getPostsFromDB(props.query)
    }
  },
  { immediate: true },
)

watch(props, async (newValue) => {
  getPostsFromDB(newValue.query)
})
</script>

<template>
  <h2>Posts:</h2>
  <div class="flex items-center justify-center">
    <ItemList :items="items" />
  </div>
</template>
