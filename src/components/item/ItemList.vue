<script setup lang="ts">
import { useToast } from 'primevue/usetoast'

import type { SavedRedditItem } from '~/logic/db'
import { setTag, setSubreddit, setAuthor } from '~/logic/search-store'
import AddTagsInput from '~/components/AddTagsInput.vue'
import ItemCard from '~/components/item/ItemCard.vue'
import ItemCardCompact from '~/components/item/ItemCardCompact.vue'
import ActionMenu from '~/components/item/ActionMenu.vue'
import { getUserInfo } from '~/reddit/me'
import { unsave } from '~/reddit/unsave'
import { updateItem } from '~/logic/db/mutations'

const props = defineProps<{
  items: SavedRedditItem[]
  listType: 'list' | 'compact'
  onTagsUpdate: (tags: string[], reditId: string) => void
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
  let item = props.items.find((item) => item.name === name)
  if (!item) return
  await updateItem(item._id, { saved: false })
  await props.onUnsave(item._id)
  toast.add({ severity: 'info', summary: 'Info', detail: 'Unsaved the item', life: 1000 })
}

const redditId = ref('')
const selectedItem = computed(() => {
  if (!redditId.value) return
  return props.items.find((item) => item.name === redditId.value)
})

const actionMenuRef = ref()
const toggleActionMenu = (event: Event) => {
  const li = (event.currentTarget as HTMLElement).closest('[data-reddit-name]') as HTMLElement | null
  redditId.value = li?.dataset.redditName || ''
  actionMenuRef.value.toggle(event)
}

const tagMenuRef = ref()
const toggleTagMenu = (event: Event) => {
  const li = (event.currentTarget as HTMLElement).closest('[data-reddit-name]') as HTMLElement | null
  redditId.value = li?.dataset.redditName || ''
  tagMenuRef.value.toggle(event)
}
</script>

<template>
  <ol class="flex w-full flex-col gap-0 text-left">
    <li v-for="item in items" :key="item.id" :data-reddit-name="item.name" class="flex max-w-full flex-col gap-2">
      <ItemCardCompact
        v-if="listType === 'compact'"
        :item="item"
        @subreddit-click="setSubreddit"
        @author-click="setAuthor"
      >
        <template #end>
          <button class="flex h-full items-center" title="More actions" aria-haspopup="true" @click="toggleActionMenu">
            <PhDotsThreeBold class="h-auto w-5" />
          </button>
        </template>
      </ItemCardCompact>
      <ItemCard
        v-else
        :item="item"
        @add-tags="toggleTagMenu"
        @tag-click="setTag"
        @subreddit-click="setSubreddit"
        @author-click="setAuthor"
      >
        <template #footer-end>
          <button class="ml-2" title="More actions" aria-haspopup="true" @click="toggleActionMenu">
            <PhDotsThreeBold class="h-auto w-5" />
          </button>
        </template>
      </ItemCard>
    </li>
  </ol>

  <OverlayPanel ref="actionMenuRef" :pt="{ content: 'p-0 bg-surface-800 rounded', root: 'z-100' }">
    <ActionMenu
      v-if="selectedItem"
      :item="selectedItem"
      @update="onUpdate"
      @remove="() => removeItem(selectedItem?._id as number)"
      @unsave="() => unsaveOnReddit(selectedItem?.name as string)"
    />
  </OverlayPanel>

  <OverlayPanel ref="tagMenuRef" class="px-0 py-0" :pt="{ content: 'p-2' }">
    <AddTagsInput :reddit-id="redditId" @exit="onTagsUpdate" />
  </OverlayPanel>
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
