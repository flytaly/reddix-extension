<script setup lang="ts">
import MainLayout from '~/components/pages/MainLayout.vue'
import PhDownloadBold from '~icons/ph/upload-bold'
import RateLimitsBlock from '~/components/RateLimitsBlock.vue'
import LogList from '~/components/LogList.vue'
import { fetchInfo, parseCSV, importJSON } from '~/logic/transform/import-utils'
import { addMessage } from '~/logic/log-messages'

const isImporting = ref(false)

const nameList = ref<string[]>([])
const needConfirmCategory = ref(false)

const selectedCategory = ref<ItemCategory>('saved')
const categories = ['saved', 'upvoted']

async function update(e: Event) {
  if (isImporting.value) return
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  isImporting.value = true
  if (file.type.match(/text\/csv/i)) {
    const data = await parseCSV(file)
    if (data && data.newItems?.length) {
      selectedCategory.value = data.category
      nameList.value = data.newItems
      needConfirmCategory.value = true
      addMessage(`Confirmation is required`)
    }
  } else if (file.type.match(/application\/json/i)) {
    await importJSON(file)
  }
  isImporting.value = false
}

function cancelImport() {
  needConfirmCategory.value = false
  isImporting.value = false
  nameList.value = []
  addMessage('Import canceled')
}

async function confirmImport() {
  if (isImporting.value) return
  isImporting.value = true
  needConfirmCategory.value = false
  const list = nameList.value
  await fetchInfo(list, selectedCategory.value)
  nameList.value = []
  isImporting.value = false
}
</script>

<template>
  <MainLayout>
    <main class="mx-auto grid max-w-screen-md grid-cols-[auto_1fr] grid-rows-[auto_1fr]">
      <div />
      <h2 class="mt-8 flex justify-center">
        <span>Import</span>
      </h2>
      <aside class="mr-auto px-4">
        <RateLimitsBlock />
      </aside>
      <div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
        <div v-if="needConfirmCategory" class="space-y-2 text-sm">
          <div>Importing {{ nameList.length }} new items.</div>
          <div>Please, confirm the item category:</div>
          <Dropdown
            v-model="selectedCategory"
            :options="categories"
            placeholder="Select a category"
            class="mt-2 text-sm"
          />
          <div class="flex gap-4">
            <Button outlined @click="cancelImport">Cancel</Button>
            <Button @click="confirmImport">Import</Button>
          </div>
        </div>
        <div v-if="!isImporting && !needConfirmCategory">
          <label
            class="flex rounded-sm bg-primary-500 px-2.5 py-1.5 text-sm font-semibold text-light shadow-sm hover:bg-primary-600 dark:bg-primary-400 dark:text-surface-900 dark:hover:bg-primary-300"
          >
            <PhDownloadBold class="mr-2 h-5 w-5" />
            <span>Choose</span>
            <input type="file" class="hidden" accept=".json,.csv" :disabled="isImporting" @change="update" />
          </label>
        </div>
        <LogList />
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
