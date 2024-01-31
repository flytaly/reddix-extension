<script setup lang="ts">
import { type SavedRedditItem } from '~/logic/db'

const props = defineProps<{
  item: SavedRedditItem
  onUpdate: (item: SavedRedditItem) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'unsave'): void
}>()

const confirmRemoving = ref(false)
const confirmUnsave = ref(false)

function onRemove() {
  emit('remove')
  confirmRemoving.value = false
}

function onUnsave() {
  emit('unsave')
  confirmUnsave.value = false
}

const updating = ref(false)
const updateItem = async () => {
  if (updating.value) return
  updating.value = true
  await props.onUpdate(props.item)
  updating.value = false
}
</script>

<template>
  <ul class="flex flex-col gap-4 p-3 text-sm">
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

    <li v-if="item.saved">
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
        <br />
        <button class="ml-2" @click="onUnsave">Yes</button>
        <span class="mx-2">/</span>
        <button @click="confirmUnsave = false">No</button>
      </div>
    </li>

    <li>
      <button
        v-if="!confirmRemoving"
        class="flex w-full gap-1 whitespace-nowrap"
        title="Remove the item locally from the extension"
        @click="confirmRemoving = true"
      >
        <PhTrashSimpleDuotone class="shrink-0" />
        remove
      </button>
      <div v-if="confirmRemoving" class="mr-2" title="Remove the item locally from the extension">
        <span class="text-primary-400">Remove the item?</span>
        <br />
        <button class="ml-2" @click="onRemove">Yes</button>
        <span class="mx-2">/</span>
        <button @click="confirmRemoving = false">No</button>
      </div>
    </li>
  </ul>
</template>

<style lang="postcss" scoped></style>
