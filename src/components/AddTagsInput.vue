<script setup lang="ts">
import { ref, nextTick } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import { SavedRedditItem, db } from '~/logic/db'

const props = defineProps<{
  redditId: string
}>()

type Itm = Array<[string, number]>

const value = ref<Itm>([])
const items = ref<Itm>([])
const search = (event: { query: string }) => {
  items.value = [...Array(10).keys()].map((item, i) => (!i ? [event.query, i] : [event.query + '-' + item, i]))
}

const target = ref()

onMounted(() => {
  nextTick(() => {
    //without waiting there is a weird automatic scrolling to the top of the page, for some reason
    ;(target.value as HTMLElement).querySelector('input')?.focus()
  })
})

async function commit() {
  // await db.savedItems.update({ name: props.redditId }, {})
  await db.savedItems
    .where({ name: props.redditId })
    .modify({ _tags: value.value.map((v) => v[0]) } as Partial<SavedRedditItem>)
}
</script>

<template>
  <article ref="target">
    <h2>Add tags to {{ redditId }}</h2>
    <div class="card flex justify-center">
      <AutoComplete
        v-model="value"
        multiple
        dropdown
        :suggestions="items"
        :complete-on-focus="true"
        :delay="200"
        @complete="search"
        @item-select="commit"
      >
        <template #chip="slotProps"> #{{ slotProps.value[0] }} </template>
        <template #option="slotProps">
          <div class="align-options-center flex">
            <div>#{{ slotProps.option[0] }} -- ({{ slotProps.option[1] }})</div>
          </div>
        </template>
      </AutoComplete>
    </div>
  </article>
</template>
