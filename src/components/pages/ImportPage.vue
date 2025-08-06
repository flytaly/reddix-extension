<script setup lang="ts">
import ImportHelp from '~/components/help/ImportHelp.vue'
import LogList from '~/components/LogList.vue'
import MainLayout from '~/components/pages/MainLayout.vue'
import RateLimitsBlock from '~/components/RateLimitsBlock.vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { addMessage } from '~/logic/log-messages'
import { fetchInfo, importJSON, parseCSV } from '~/logic/transform/import-utils'

const isImporting = ref(false)

const nameList = ref<string[]>([])
const needConfirmCategory = ref(false)

const selectedCategory = ref<ItemCategory>('saved')
const categories = ['saved', 'upvoted']

async function update(e: Event) {
  if (isImporting.value)
    return
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file)
    return
  isImporting.value = true
  if (file.type.match(/text\/csv/i)) {
    const data = await parseCSV(file)
    if (data && data.newItems?.length) {
      selectedCategory.value = data.category
      nameList.value = data.newItems
      needConfirmCategory.value = true
      addMessage(`Confirmation is required`)
    }
  }
  else if (file.type.match(/application\/json/i)) {
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
  if (isImporting.value)
    return
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
    <Card class="mx-auto mt-2 w-full max-w-[120ch]">
      <CardHeader>
        <CardTitle>
          <h2 class="flex items-center">
            <ph-download-bold class="mr-2 h-5 w-5" />
            Import
          </h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple">
          <AccordionItem value="item-1">
            <AccordionTrigger>Importing JSON files</AccordionTrigger>
            <AccordionContent>
              <div>
                JSON files that have been exported from this extension using the Export page. These files contain full
                information about your posts and comments.
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Importing Reddit CSV files</AccordionTrigger>
            <AccordionContent>
              <ImportHelp />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <main class="mt-8 grid grid-cols-[auto_1fr]">
          <aside class="mr-auto px-4">
            <RateLimitsBlock />
          </aside>
          <div>
            <div class="mx-auto max-w-max">
              <label
                class="flex rounded-xs bg-primary-500 px-2.5 py-1.5 text-sm font-semibold text-light shadow-xs hover:bg-primary-600 dark:bg-primary-400 dark:text-surface-900 dark:hover:bg-primary-300"
              >
                <ph-download-bold class="mr-2 h-5 w-5" />
                <span>{{ isImporting || needConfirmCategory ? 'Importing...' : 'Choose' }}</span>
                <input
                  type="file"
                  class="hidden"
                  accept=".json,.csv"
                  :disabled="isImporting || needConfirmCategory"
                  @change="update"
                >
              </label>
            </div>
            <div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
              <div v-if="needConfirmCategory" class="space-y-2 text-sm">
                <div>Importing {{ nameList.length }} new items.</div>
                <div>Please, confirm the item category:</div>
                <Select v-model="selectedCategory">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div class="flex gap-4">
                  <Button variant="outline" @click="cancelImport">
                    Cancel
                  </Button>
                  <Button @click="confirmImport">
                    Import
                  </Button>
                </div>
              </div>
            </div>
            <LogList />
          </div>
        </main>
      </CardContent>
    </Card>
  </MainLayout>
</template>
