<script setup lang="ts">
import { ref, nextTick } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { SavedRedditItem, db } from '~/logic/db'
import { getTagsArray, stats } from '~/logic/store'

const props = defineProps<{
  redditId: string
}>()

const emit = defineEmits<{
  exit: [tags: string[], redditId: string]
}>()

type TagList = Array<[string, number]>

const currentTags = ref<TagList>([])
const allTags = ref<TagList>([])
const completeItems = ref<TagList>([])

const parts = ref<Record<string, TagList>>({})

onMounted(async () => {
  const item = await db.savedItems.where({ name: props.redditId }).first()
  if (!item?._tags) return
  currentTags.value = item._tags.map((tag) => [tag, 0])
})

onUnmounted(() => {
  emit(
    'exit',
    currentTags.value.map(([tag]) => tag),
    props.redditId,
  )
})

watch(
  () => stats.tags,
  () => {
    parts.value = {}
    allTags.value = getTagsArray()
    // split tag words
    allTags.value.forEach(([tag, count]) => {
      for (let i = 0; i < tag.length; i++) {
        const substr = tag.slice(0, i + 1)
        if (!parts.value[substr]) {
          parts.value[substr] = []
        }
        if (parts.value[substr].length >= 10) {
          continue
        }
        parts.value[substr] = [...parts.value[substr], [tag, count]]
      }
    })
  },
  { immediate: true },
)

const search = (event: { query: string }) => {
  let tags = parts.value[event.query]
  if (!tags) {
    completeItems.value = !event.query ? allTags.value.slice(0, 30) : [[event.query, stats.tags[event.query]]]
    return
  }
  if (!event.query || tags[0][0] == event.query) {
    completeItems.value = tags
    return
  }
  completeItems.value = [[event.query, stats.tags[event.query]], ...tags]
}

const target = ref()

onMounted(() => {
  nextTick(() => {
    //without waiting there is a weird automatic scrolling to the top of the page, for some reason
    ;(target.value as HTMLElement).querySelector('input')?.focus()
  })
})

async function commit() {
  const set = new Set(currentTags.value.map((v) => v[0]))
  await db.savedItems.where({ name: props.redditId }).modify({ _tags: Array.from(set) } as Partial<SavedRedditItem>)
}
</script>

<template>
  <article ref="target">
    <h2 class="mb-0.5">Add tags to the item</h2>
    <div class="card flex justify-center">
      <AutoComplete
        v-model="currentTags"
        multiple
        dropdown
        :suggestions="completeItems"
        :complete-on-focus="true"
        :delay="200"
        @complete="search"
        @item-select="commit"
        @item-unselect="commit"
      >
        <template #chip="slotProps"> #{{ slotProps.value[0] }} </template>
        <template #option="slotProps">
          <div class="flex justify-between gap-2">
            <div>#{{ slotProps.option[0] }}</div>
            <div class="ml-auto text-surface-400 dark:text-surface-500">{{ slotProps.option[1] || 'new' }}</div>
          </div>
        </template>
      </AutoComplete>
    </div>
  </article>
</template>
