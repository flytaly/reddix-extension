<script setup lang="ts">
import { ref, shallowRef, onMounted, nextTick } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import OverlayPanel from 'primevue/overlaypanel'

import AddTagsInput from '~/components/AddTagsInput.vue'
import ItemList from '~/components/ItemList.vue'
import { ITEMS_ON_PAGE } from '~/constants'
import { SavedRedditItem } from '~/logic/db'
import { getPostsFromDB } from '~/logic/db/queries'
import { removeItems } from '~/logic/db/mutations'
import { search } from '~/logic/search-store'
import { state } from '~/logic/options-stores'

const lastItemId = ref(0)
const isEnd = ref(false)
const items = shallowRef<SavedRedditItem[]>()
const target = ref(null)
const targetIsVisible = ref(false)

let lastQueryId = 0

onMounted(() => loadMore())

const toast = useToast()

async function loadMore() {
  const current = ++lastQueryId
  try {
    const id = lastItemId.value
    const items = await getPostsFromDB(search, id, ITEMS_ON_PAGE)
    // make sure the query is not out of date
    if (lastQueryId === current) {
      onNewItems(items, id, ITEMS_ON_PAGE)
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'DB Error', detail: (error as any)?.message || '', life: 3000 })
    console.error(error)
  }
}

const { pause, resume } = useIntersectionObserver(
  target,
  ([{ isIntersecting }], _observerElement) => {
    targetIsVisible.value = isIntersecting
    if (!isIntersecting || isEnd.value || !items.value?.length) return
    pause()
    loadMore()
  },
  { rootMargin: '100px', immediate: false },
)

function onNewItems(incoming: SavedRedditItem[], prevLastId: number, limit: number) {
  isEnd.value = incoming.length < limit
  console.log(`get ${incoming.length} items from db. After id ${prevLastId}`)
  nextTick(() => resume())
  if (prevLastId === 0 || !items.value?.length) {
    items.value = incoming
  } else {
    items.value = [...items.value, ...incoming]
  }
  lastItemId.value = items.value.at(-1)?._id || 0
}

watch(
  () => state.isFetching,
  (isFetching) => {
    if (isFetching) return
    lastItemId.value = 0
    return loadMore()
  },
)
watch(search, async () => {
  lastItemId.value = 0
  return loadMore()
})

const redditId = ref('')
const op = ref()
const toggle = (event: Event & { currentTarget: HTMLElement }) => {
  const li = event.currentTarget.closest('[data-reddit-name]') as HTMLElement | null
  redditId.value = li?.dataset.redditName || ''
  op.value.toggle(event)
}

const updateTags = (tags: string[], redditId: string) => {
  if (!redditId) return
  items.value = items.value?.map((item) => {
    if (item.name === redditId) {
      return { ...item, _tags: tags }
    }
    return item
  })
}

async function onRemove(itemIds: number[]) {
  await removeItems(itemIds)
  items.value = items.value?.filter((item) => !itemIds.includes(item._id))
}

async function markUnsaved(itemId: number) {
  items.value = items.value?.map((item) => {
    if (item._id === itemId) {
      return { ...item, saved: false }
    }
    return item
  })
}
</script>

<template>
  <Toast />
  <div class="mb-10 flex flex-col items-center justify-center">
    <OverlayPanel ref="op" class="px-0 py-0" :pt="{ content: 'p-2' }">
      <AddTagsInput :reddit-id="redditId" @exit="updateTags" />
    </OverlayPanel>
    <ItemList :items="items" :add-tags="toggle" @unsave="markUnsaved" @remove="onRemove" />
    <div v-if="!isEnd">
      <button ref="target" class="p-2 py-4 text-primary-700 dark:text-primary-400" tabindex="-1" @click="loadMore">
        Load more
      </button>
    </div>
  </div>
</template>
