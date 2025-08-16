<script setup lang="ts">
import type { ReferenceElement } from 'reka-ui'
import type { WrappedItem } from '~/logic/wrapped-item'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import ItemCard from '~/components/item/ItemCard.vue'
import ItemCardCompact from '~/components/item/ItemCardCompact.vue'
import ItemTags from '~/components/item/ItemTags.vue'
import VirtualList from '~/components/item/VirtualList.vue'
import { Popover, PopoverContent } from '~/components/ui/popover'
import { updateItem } from '~/logic/db/mutations'
import { setAuthor, setSubreddit, setTag } from '~/logic/search-store'
import { getUserInfo } from '~/reddit/me'
import { unsave } from '~/reddit/unsave'

const props = defineProps<{
  items: WrappedItem[]
  listType: 'list' | 'compact' | 'edit'
  onTagsUpdate: (updated: Record<number, string[]>) => void
  onDelete: (ids: number[]) => void
  onUnsave: (id: number) => Promise<void>
  onUpdate: (item: WrappedItem) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'scroll-end'): void
}>()

const checked = defineModel<number[]>('checked')

function deleteItem(id?: number) {
  if (!id)
    return
  props.onDelete([id])
}

const toast = useToast()

async function unsaveOnReddit(name?: string) {
  if (!name)
    return
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
  const item = props.items.find(item => item.redditId === name)
  if (!item)
    return
  await updateItem(item.dbId, { saved: false })
  await props.onUnsave(item.dbId)
  toast.add({ severity: 'info', summary: 'Info', detail: 'Unsaved the item', life: 1000 })
}

const redditId = ref('')
const selectedItem = computed(() => {
  if (!redditId.value)
    return
  return props.items.find(item => item.redditId === redditId.value)
})

const actionMenuRef = ref<ReferenceElement>()
const actionMenuOpened = ref(false)

function toggleActionMenu(event: Event) {
  const li = (event.currentTarget as HTMLElement).closest('[data-reddit-name]') as HTMLElement | null
  redditId.value = li?.dataset.redditName || ''
  actionMenuOpened.value = !actionMenuOpened.value
  if (actionMenuOpened.value) {
    actionMenuRef.value = event.currentTarget as HTMLElement
  }
}

const virualList = ref<InstanceType<typeof VirtualList>>()

watch(
  () => props.listType,
  () => {
    virualList.value?.onResize()
  },
)

watch(
  () => props.items.length,
  () => {
    checked.value = []
  },
)
</script>

<template>
  <VirtualList ref="virualList" :items="items" @scroll-end="emit('scroll-end')">
    <template #item="{ item }">
      <div :data-reddit-name="item.redditId" class="mx-auto max-w-main-column">
        <ItemCardCompact
          v-if="listType === 'compact'"
          :key="item.dbId"
          :item="item"
          @subreddit-click="setSubreddit"
          @author-click="setAuthor"
        >
          <template #end>
            <button class="btn flex h-full items-center" title="Actions" aria-haspopup="true" @click="toggleActionMenu">
              <ph-dots-three-vertical class="h-4 w-auto xs:h-5" />
            </button>
          </template>
        </ItemCardCompact>

        <ItemCardCompact
          v-else-if="listType === 'edit'"
          :item="item"
          @subreddit-click="setSubreddit"
          @author-click="setAuthor"
        >
          <template #start>
            <div class="relative flex h-full items-center">
              <Checkbox
                v-model="checked"
                :pt="{
                  root: ({ context }) => ({
                    class:
                      `pl-2 pr-2 flex h-full items-center justify-end ${
                        context.checked
                          ? 'bg-primary-100 dark:bg-primary-800 hover:bg-primary-300 dark:hover:bg-primary-600'
                          : 'hover:bg-primary-100 dark:hover:bg-primary-700'}`,
                  }),
                }"
                name="item"
                :value="item.dbId"
              />
            </div>
          </template>
          <template
            v-if="item.tags?.length"
            #footer-start
          >
            <div class="ml-1">
              <ItemTags
                :item="item"
                @tags-update="onTagsUpdate"
                @tag-click="setTag"
              />
            </div>
          </template>
          <template #end>
            <button class="btn flex h-full items-center" title="Actions" aria-haspopup="true" @click="toggleActionMenu">
              <ph-dots-three-vertical class="h-4 w-auto xs:h-5" />
            </button>
          </template>
        </ItemCardCompact>

        <ItemCard
          v-else
          :item="item"
          @subreddit-click="setSubreddit"
          @author-click="setAuthor"
        >
          <template #footer-start>
            <ItemTags
              :item="item"
              @tags-update="onTagsUpdate"
              @tag-click="setTag"
            />
          </template>
          <template #footer-end>
            <button class="btn ml-2" title="Actions" aria-haspopup="true" @click="toggleActionMenu">
              <ph-dots-three-vertical class="h-4 w-auto" />
            </button>
          </template>
        </ItemCard>
      </div>
    </template>
  </VirtualList>

  <Popover
    :open="actionMenuOpened"
    @update:open="(isOpen) => actionMenuOpened = isOpen"
  >
    <PopoverAnchor
      :reference="actionMenuRef"
    />
    <PopoverContent
      class="p-0 w-max bg-popover rounded-sm ring-1 ring-surface-400 dark:ring-surface-500"
    >
      <ActionMenu
        v-if="selectedItem"
        :item="selectedItem"
        @tags-update="onTagsUpdate"
        @update="onUpdate"
        @delete="() => deleteItem(selectedItem?.dbId)"
        @unsave="() => unsaveOnReddit(selectedItem?.redditId)"
      />
    </PopoverContent>
  </Popover>
</template>
