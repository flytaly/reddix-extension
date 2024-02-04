<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import PhList from '~icons/ph/list'
import PhRows from '~icons/ph/rows'
import PhNotePencil from '~icons/ph/note-pencil'

import ItemList from '~/components/item/ItemList.vue'
import MassEditMenu from '~/components/item/MassEditMenu.vue'
import { ITEMS_ON_PAGE } from '~/constants'
import { getPostsFromDB } from '~/logic/db/queries'
import { removeItems, updateItem } from '~/logic/db/mutations'
import { search } from '~/logic/search-store'
import { state } from '~/logic/options-stores'
import { getItemsInfo } from '~/reddit'
import { FunctionalComponent } from 'vue'
import { WrappedItem } from '~/logic/wrapped-item'

const lastItemId = ref(0)
const isEnd = ref(false)
const items = shallowRef<WrappedItem[]>()
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

function onNewItems(incoming: WrappedItem[], prevLastId: number, limit: number) {
  isEnd.value = incoming.length < limit
  console.log(`get ${incoming.length} items from db. After id ${prevLastId}`)
  nextTick(() => resume())
  if (prevLastId === 0 || !items.value?.length) {
    items.value = incoming
  } else {
    items.value = [...items.value, ...incoming]
  }
  lastItemId.value = items.value.at(-1)?.dbId || 0
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

const updateTags = (tags: string[], redditId: string) => {
  if (!redditId) return
  items.value = items.value?.map((item) => {
    if (item.redditId === redditId) {
      item.tags = tags
      return item.clone()
    }
    return item
  })
}

async function onRemove(itemIds: number[]) {
  await removeItems(itemIds)
  items.value = items.value?.filter((item) => !itemIds.includes(item.dbId))
}

async function markUnsaved(itemId: number) {
  items.value = items.value?.map((item) => {
    if (item.dbId === itemId) {
      item.item.saved = false
      return item.clone()
    }
    return item
  })
}

async function onItemUpdate(item: WrappedItem) {
  const [resp, err] = await getItemsInfo([item.redditId])
  if (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err, life: 3000 })
    return
  }
  const updated = resp?.data.children.find((u) => u.data.name == item.redditId)
  if (!updated) return
  try {
    await updateItem(item.dbId, updated.data)
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error, life: 3000 })
  }

  items.value = items.value?.map((oldItem) => {
    if (oldItem.dbId === item.dbId) {
      oldItem.update(updated.data)
      return oldItem.clone()
    }
    return oldItem
  })

  toast.add({ severity: 'info', summary: 'Info', detail: 'Item updated', life: 1000 })
}

type viewType = 'list' | 'compact' | 'edit'
const viewOptions: { iconCmp: FunctionalComponent; value: viewType; title: string }[] = [
  { iconCmp: PhRows, value: 'list', title: 'List' },
  { iconCmp: PhList, value: 'compact', title: 'Compact list' },
  { iconCmp: PhNotePencil, value: 'edit', title: 'Edit' },
]
const view = ref(viewOptions[2])

const checkedItems = defineModel<number[]>({ default: [] })
</script>

<template>
  <Toast />
  <div class="mb-10 flex flex-col items-center justify-center">
    <div class="my-2 flex w-full justify-end gap-2">
      <SelectButton
        v-model="view"
        :options="viewOptions"
        option-label="value"
        data-key="value"
        aria-labelledby="title"
        :allow-empty="false"
      >
        <template #option="slotProps">
          <component :is="slotProps.option.iconCmp"></component>
        </template>
      </SelectButton>
    </div>

    <MassEditMenu v-if="view.value === 'edit'" v-model="checkedItems" :items="items || []" />

    <ItemList
      v-model:checked="checkedItems"
      :items="items || []"
      :list-type="view.value"
      @tags-update="updateTags"
      @unsave="markUnsaved"
      @remove="onRemove"
      @update="onItemUpdate"
    />
    <div v-if="!isEnd">
      <button ref="target" class="p-2 py-4 text-primary-700 dark:text-primary-400" tabindex="-1" @click="loadMore">
        Load more
      </button>
    </div>
  </div>
</template>
