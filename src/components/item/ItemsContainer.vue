k
<script setup lang="ts">
import PhList from '~icons/ph/list'
import PhNotePencil from '~icons/ph/note-pencil'
import PhRows from '~icons/ph/rows'
import type { FunctionalComponent } from 'vue'
import { useToast } from 'primevue/usetoast'

import ItemList from '~/components/item/ItemList.vue'
import MassEditMenu from '~/components/item/MassEditMenu.vue'
import { ITEMS_ON_PAGE } from '~/constants'
import { WrappedItem } from '~/logic/wrapped-item'
import { deleteItems, updateItem } from '~/logic/db/mutations'
import { getItemsInfo } from '~/reddit'
import { getPostsFromDB } from '~/logic/db/queries'
import { search } from '~/logic/search-store'
import { state } from '~/logic/options-stores'

const lastItem = shallowRef<WrappedItem | null>(null)
const isEnd = ref<boolean | null>(null)
const items = shallowRef<WrappedItem[]>()
const isLoading = ref(false)

let lastQueryId = 0

onMounted(() => loadMore())

const toast = useToast()

async function loadMore(loadAll?: boolean) {
  if (isEnd.value) return
  isLoading.value = true
  const current = ++lastQueryId
  const limit = loadAll ? Infinity : ITEMS_ON_PAGE
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
  } catch (error) {
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
  if (append && items.value?.length) {
    newItems = [...items.value, ...incoming]
  }
  items.value = newItems
  lastItem.value = items.value.at(-1) || null
}

watch(
  () => state.isFetching,
  (isFetching) => {
    if (!isFetching) reload()
  },
)

watch(search, () => reload())

const updateTags = (updates: Record<number, string[]>) => {
  if (!Object.keys(updates).length) return
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
  items.value = items.value?.filter((item) => !set.has(item.dbId))
  if (!items.value?.length) {
    loadMore()
  }
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
const view = ref(viewOptions[0])

const sortOverlay = ref()

const checkedItems = defineModel<number[]>({ default: [] })
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="mx-auto my-1 flex w-full max-w-main-column items-center justify-end gap-2 pr-4 sm:my-2">
      <SelectButton
        v-model="view"
        :options="viewOptions"
        option-label="value"
        data-key="value"
        aria-labelledby="title"
        :allow-empty="false"
        :pt="{ button: '!px-2 !py-1 sm:!px-2.5 sm:!py-1.5 text-sm' }"
        :pt-options="{ mergeProps: true }"
      >
        <template #option="slotProps">
          <component :is="slotProps.option.iconCmp"></component>
        </template>
      </SelectButton>

      <button class="btn ml-4 text-sm" @click="sortOverlay.toggle">
        <ph-sort-descending v-if="search.direction === 'desc'" />
        <ph-sort-ascending v-else />
      </button>
    </div>

    <MassEditMenu
      v-if="view.value === 'edit'"
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
          Load all</button
        >]
      </span>
    </MassEditMenu>

    <ItemList
      v-model:checked="checkedItems"
      :items="items || []"
      :list-type="view.value"
      @tags-update="updateTags"
      @unsave="markUnsaved"
      @delete="onDelete"
      @update="onItemUpdate"
      @scroll-end="async () => (isLoading ? undefined : loadMore())"
    />
  </div>
  <OverlayPanel
    ref="sortOverlay"
    :pt="{
      content: 'p-0 bg-surface-100 dark:bg-surface-800 rounded ring-1 ring-surface-400 dark:ring-surface-500',
      root: 'z-100',
    }"
  >
    <ul class="flex min-w-28 flex-col gap-2 py-2 text-base">
      <li>
        <button class="btn flex items-center gap-1 px-2" @click="search.direction = 'asc'">
          <ph-sort-ascending :class="{ 'text-primary-500 dark:text-primary-400': search.direction === 'asc' }" />asc
        </button>
      </li>
      <li>
        <button class="btn flex items-center gap-1 px-2" @click="search.direction = 'desc'">
          <ph-sort-descending :class="{ 'text-primary-500 dark:text-primary-400': search.direction === 'desc' }" />desc
        </button>
      </li>
    </ul>
  </OverlayPanel>
</template>
