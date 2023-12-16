<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { SavedRedditItem } from '~/logic/db'
import { SearchQuery, getPostsFromDB } from '~/logic/db/queries'
import { state, search } from '~/logic/store'
import { type RedditItem } from '~/reddit/reddit-types'
import ItemList from '~/components/ItemList.vue'
import { ITEMS_ON_PAGE } from '~/constants'

const offset = ref(0)
const isEnd = ref(false)
const items = ref<RedditItem[]>()

const target = ref(null)
const targetIsVisible = ref(false)

async function addPosts(searchDetails: SearchQuery, offset = 0, limit = ITEMS_ON_PAGE) {
  const items = await getPostsFromDB(searchDetails, offset, limit)
  onNewItems(items, offset, ITEMS_ON_PAGE)
}

onMounted(() => addPosts(search))

const { pause, resume } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], _observerElement) => {
    targetIsVisible.value = isIntersecting
    if (!isIntersecting || isEnd.value || !items.value?.length) return
    pause()
    offset.value += ITEMS_ON_PAGE
  },
  { rootMargin: '100px', immediate: false },
)

function onNewItems(incoming: SavedRedditItem[], offset: number, limit: number) {
  isEnd.value = incoming.length < limit
  nextTick(() => resume())
  if (offset === 0 || !items.value?.length) {
    items.value = incoming
    return
  }
  items.value = [...items.value, ...incoming]
}

watch(
  () => state.isFetching,
  (isFetching) => {
    if (isFetching) return
    addPosts(search, offset.value)
  },
)
watch(search, async (newValue) => {
  offset.value = 0
  await addPosts(newValue, 0)
})
watch(offset, () => addPosts(search, offset.value, ITEMS_ON_PAGE))
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <ItemList :items="items" />
    <div v-if="!isEnd">
      <button ref="target" class="p-2 py-4" @click="offset += ITEMS_ON_PAGE">Load more</button>
    </div>
  </div>
</template>
