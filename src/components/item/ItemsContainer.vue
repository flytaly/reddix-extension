<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import type { WrappedItem } from '~/logic/wrapped-item'
import { useToast } from 'primevue/usetoast'
import PhList from '~icons/ph/list'
import PhNotePencil from '~icons/ph/note-pencil'
import PhRows from '~icons/ph/rows'
import ItemList from '~/components/item/ItemList.vue'
import MassEditMenu from '~/components/item/MassEditMenu.vue'
import SortMenu from '~/components/item/SortMenu.vue'
import { ITEMS_ON_PAGE } from '~/constants'
import { inputsStorage } from '~/logic/browser-storage'
import { deleteItems, updateItem } from '~/logic/db/mutations'
import { getPostsFromDB } from '~/logic/db/queries'
import { search } from '~/logic/search-store'
import { state } from '~/logic/stores'
import { getItemsInfo } from '~/reddit'

const lastItem = shallowRef<WrappedItem | null>(null)
const isEnd = ref<boolean | null>(null)
const items = shallowRef<WrappedItem[]>()
const isLoading = ref(false)

let lastQueryId = 0

onMounted(() => loadMore())

const toast = useToast()

async function loadMore(loadAll?: boolean) {
  if (isEnd.value)
    return
  isLoading.value = true
  const current = ++lastQueryId
  const limit = loadAll ? Number.POSITIVE_INFINITY : ITEMS_ON_PAGE
  try {
    const last = lastItem.value
    const items = await getPostsFromDB(search, { lastItem: last, limit: limit + 1 })
    // make sure the query is not out of date
    if (lastQueryId === current) {
      isEnd.value = items.length < limit + 1
      const slice = loadAll ? items : items.slice(0, limit)
      console.log(`get ${slice.length} items from db. After id ${last?.dbId || 'none'}`)
      onNewItems(slice, Boolean(last))
    }
  }
  catch (error) {
    toast.add({ severity: 'error', summary: 'DB Error', detail: (error as any)?.message || '', life: 3000 })
    console.error(error)
  }
  isLoading.value = false
}

async function reload() {
  lastItem.value = null
  isEnd.value = null
  return loadMore()
}

function onNewItems(incoming: WrappedItem[], append: boolean) {
  let newItems = incoming
  if (append && items.value?.length)
    newItems = [...items.value, ...incoming]

  items.value = newItems
  lastItem.value = items.value.at(-1) || null
}

watch(
  () => state.isFetching,
  (isFetching) => {
    if (!isFetching)
      reload()
  },
)

watch(search, () => reload())

function updateTags(updates: Record<number, string[]>) {
  if (!Object.keys(updates).length)
    return
  items.value = items.value?.map((item) => {
    if (updates[item.dbId]) {
      item.tags = updates[item.dbId]
      return item.clone()
    }
    return item
  })
}

async function onDelete(itemIds: number[]) {
  await deleteItems(itemIds)
  const set = new Set(itemIds)
  items.value = items.value?.filter(item => !set.has(item.dbId))
  if (!items.value?.length)
    loadMore()
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
  const updated = resp?.data.children.find(u => u.data.name === item.redditId)
  if (!updated)
    return
  try {
    await updateItem(item.dbId, updated.data)
  }
  catch (error) {
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

const viewOptions: { iconCmp: FunctionalComponent, view: ViewType, title: string }[] = [
  { iconCmp: PhRows, view: 'list', title: 'List view' },
  { iconCmp: PhList, view: 'compact', title: 'Compact list view' },
  { iconCmp: PhNotePencil, view: 'edit', title: 'Edit view' },
]

const view = ref<ViewType | undefined>(inputsStorage.value.currentView || 'list')
watch(view, () => {
  inputsStorage.value.currentView = view.value || 'list'
})

watch(
  () => inputsStorage.value.sortDirection,
  dir => (search.direction = dir),
  { immediate: true },
)

watch(
  () => inputsStorage.value.sortBy,
  sortBy => (search.sortBy = sortBy),
  { immediate: true },
)

const checkedItems = defineModel<number[]>({ default: [] })
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="mx-auto my-1 flex w-full max-w-main-column items-center justify-end gap-2 pr-4 sm:my-2">
      <ToggleGroup v-model="view" type="single" variant="outline">
        <ToggleGroupItem
          v-for="v in viewOptions"
          :key="v.view"
          :value="v.view"
          :title="v.title"
          class="w-min h-auto py-1 px-2.5 bg-transparent dark:bg-transparent text-foreground dark:text-foreground
           data-[state=on]:text-foreground! data-[state=on]:bg-surface-400/20! hover:bg-surface-400/20! hover:text-primary!"
        >
          <component :is="v.iconCmp" />
        </ToggleGroupItem>
      </ToggleGroup>
      <SortMenu />
    </div>

    <MassEditMenu
      v-if="view === 'edit'"
      v-model="checkedItems"
      :items="items || []"
      @load-all="() => loadMore(true)"
      @delete="onDelete"
      @tags-update="updateTags"
    >
      <span v-if="isEnd === false" class="whitespace-nowrap">
        [<button
          class="btn underline decoration-dashed underline-offset-2"
          :disabled="isLoading"
          @click="() => loadMore(true)"
        >
          Load all</button>]
      </span>
    </MassEditMenu>

    <ItemList
      v-model:checked="checkedItems"
      :items="items || []"
      :list-type="view || 'list'"
      @tags-update="updateTags"
      @unsave="markUnsaved"
      @delete="onDelete"
      @update="onItemUpdate"
      @scroll-end="async () => (isLoading ? undefined : loadMore())"
    />
  </div>
</template>
