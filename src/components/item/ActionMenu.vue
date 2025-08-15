<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'

const props = defineProps<{
  item: WrappedItem
  onUpdate: (item: WrappedItem) => Promise<void>
  onTagsUpdate?: (updated: Record<number, string[]>) => void
}>()

const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'unsave'): void
}>()

const confirmDelete = ref(false)
const confirmUnsave = ref(false)

function onDelete() {
  emit('delete')
  confirmDelete.value = false
}

function onUnsave() {
  emit('unsave')
  confirmUnsave.value = false
}

const updating = ref(false)
async function updateItem() {
  if (updating.value)
    return
  updating.value = true
  await props.onUpdate(props.item)
  updating.value = false
}
</script>

<template>
  <ul class="flex flex-col gap-4 p-3 text-sm" :data-reddit-name="item.redditId">
    <li>
      <Popover>
        <PopoverTrigger as-child>
          <button class="flex w-full gap-1 whitespace-nowrap" title="Edit tags">
            <PhTagDuotone class="shrink-0" />
            Edit tags
          </button>
        </PopoverTrigger>
        <PopoverContent class="w-max">
          <Edit
            :item="item"
            :on-tags-update="onTagsUpdate"
          />
        </PopoverContent>
      </Popover>
    </li>

    <li>
      <button
        class="flex w-full gap-1 whitespace-nowrap"
        title="Update item information"
        :disabled="updating"
        @click="updateItem"
      >
        <PhArrowsClockwise class="shrink-0" :class="{ 'animate-spin': updating }" />
        update
      </button>
    </li>

    <li v-if="item.item.saved">
      <button
        v-if="!confirmUnsave"
        class="flex w-full gap-1 whitespace-nowrap"
        title="Unsave on Reddit. You must be logged in."
        @click="confirmUnsave = true"
      >
        <PhBookmarksSimpleDuotone class="shrink-0" />
        unsave on reddit
      </button>
      <div v-if="confirmUnsave" class="mr-2" title="Unsave on Reddit. You must be logged in.">
        <span class="text-primary-400">Unsave the item?</span>
        <br>
        <button class="ml-2" @click="onUnsave">
          Yes
        </button>
        <span class="mx-2">/</span>
        <button @click="confirmUnsave = false">
          No
        </button>
      </div>
    </li>

    <li>
      <button
        v-if="!confirmDelete"
        class="flex w-full gap-1 whitespace-nowrap"
        title="Delete the item locally from the extension"
        @click="confirmDelete = true"
      >
        <PhTrashSimpleDuotone class="shrink-0" />
        delete
      </button>
      <div v-if="confirmDelete" class="mr-2" title="Delete the item locally from the extension">
        <span class="text-primary-400">Delete the item?</span>
        <br>
        <button class="ml-2" @click="onDelete">
          Yes
        </button>
        <span class="mx-2">/</span>
        <button @click="confirmDelete = false">
          No
        </button>
      </div>
    </li>
  </ul>
</template>

<style lang="postcss" scoped>
@reference "../../styles/tailwind.css";

button {
  @apply text-dark hover:text-primary-500 active:text-primary-400 dark:text-light dark:hover:text-primary-400 dark:active:text-primary-300;
}
</style>
