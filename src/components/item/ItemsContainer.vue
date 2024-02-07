k
<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import PhList from '~icons/ph/list'
import PhRows from '~icons/ph/rows'
import PhNotePencil from '~icons/ph/note-pencil'

import ItemList from '~/components/item/ItemList.vue'
import MassEditMenu from '~/components/item/MassEditMenu.vue'
import { ITEMS_ON_PAGE } from '~/constants'
import { getPostsFromDB } from '~/logic/db/queries'
import { deleteItems, updateItem } from '~/logic/db/mutations'
import { search } from '~/logic/search-store'
import { state } from '~/logic/options-stores'
import { getItemsInfo } from '~/reddit'
import { FunctionalComponent } from 'vue'
import { WrappedItem } from '~/logic/wrapped-item'

const lastItemId = ref(0)
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
    const id = lastItemId.value
    const items = await getPostsFromDB(search, id, limit + 1)
    // make sure the query is not out of date
    if (lastQueryId === current) {
      isEnd.value = items.length < limit + 1
      const slice = loadAll ? items : items.slice(0, limit)
      onNewItems(slice, id)
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: 'DB Error', detail: (error as any)?.message || '', life: 3000 })
    console.error(error)
  }
  isLoading.value = false
}

async function reload() {
  lastItemId.value = 0
  isEnd.value = null
  return loadMore()
}

function onNewItems(incoming: WrappedItem[], prevLastId: number) {
  console.log(`get ${incoming.length} items from db. After id ${prevLastId}`)
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
    if (!isFetching) reload()
  },
)

watch(search, () => reload())

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

const checkedItems = defineModel<number[]>({ default: [] })
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <div class="mx-auto my-2 flex w-full max-w-main-column justify-end gap-2 pr-4">
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

    <MassEditMenu
      v-if="view.value === 'edit'"
      v-model="checkedItems"
      :items="items || []"
      @load-all="() => loadMore(true)"
      @delete="onDelete"
    >
      <span v-if="isEnd === false">
        [<button
          class="underline decoration-dashed underline-offset-2"
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
</template>
