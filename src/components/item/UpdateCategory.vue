<script setup lang="ts">
import type { WrappedItem } from '~/logic/wrapped-item'
import { toast } from 'vue-sonner'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { setCategories } from '~/logic/db/mutations'

const props = defineProps<{ ids: WrappedItem['dbId'][] }>()

const savedChecked = ref(false)
const upvotedChecked = ref(false)

const isValid = computed(() => savedChecked.value || upvotedChecked.value)

function getCategories(): ItemCategory[] {
  const result: ItemCategory[] = []
  if (savedChecked.value)
    result.push('saved')
  if (upvotedChecked.value)
    result.push('upvoted')
  return result
}

async function commit() {
  const cat = getCategories()
  const [_, error] = await setCategories(props.ids, cat)
  if (error) {
    toast.error('Error', { description: error.message })
  }
  else {
    toast.success('Categories updated')
  }
}
</script>

<template>
  <article class="text-sm">
    <header>
      Change the selected items' categories. At least one category must be selected.
    </header>

    <div class="my-4 space-y-2">
      <Label>
        <Checkbox
          v-model="savedChecked"
          class="rounded"
          name="saved"
        />
        saved
      </Label>
      <Label>
        <Checkbox
          v-model="upvotedChecked"
          class="rounded"
          name="upvoted"
        />
        upvoted
      </Label>
    </div>

    <footer>
      <Button
        class="ml-auto flex"
        :disabled="!isValid"
        @click="commit()"
      >
        Commit
      </Button>
    </footer>
  </article>
</template>
