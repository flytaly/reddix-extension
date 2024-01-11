<script setup lang="ts">
import { onUnmounted } from 'vue'
import MainLayout from '~/components/pages/MainLayout.vue'
import { setupStatsStore } from '~/logic/options-stores'
import PhDownloadBold from '~icons/ph/upload-bold'
import RateLimits from '~/components/RateLimits.vue'
import LogList from '~/components/LogList.vue'
import { extractIds, csvStringToArray } from '~/logic/import'
import { addMessage } from '~/logic/log-messages'
import { getItems } from '~/logic/db/queries'
import { getItemsInfo } from '~/reddit/index'
import { savePosts } from '~/logic/db/queries'

let subscription = setupStatsStore()

onUnmounted(async () => {
  ;(await subscription).unsubscribe()
})

let postsIds = [] as string[]
let commentsIds = [] as string[]

async function fetchInfo(ids: string[]) {
  addMessage(`Started getting information about the posts`)
  ids = ids.slice(0, 50)
  const [info, error] = await getItemsInfo(ids)
  if (error) {
    addMessage(`Error: ${error}`, 'error')
    return
  }
  if (!info) {
    return
  }
  await savePosts(info)
  const len = info.data.children?.length
  addMessage(`Added ${len} items`)
  // TODO: fetch more

  return info
}

async function update(e: Event) {
  const file = (e.target as HTMLInputElement)?.files?.[0]
  if (!file) return
  if (!file.type.match('text/csv')) return

  const content = await file.text()
  const rows = csvStringToArray(content)
  if (!rows?.length) return

  if (!rows[0].includes('id')) {
    addMessage(`[${file.name}] Invalid CSV file. Missing "id" column.`, 'error')
    return
  }
  if (!rows[0].includes('permalink')) {
    addMessage(`[${file.name}] Invalid CSV file. Missing "permalink" column.`, 'error')
    return
  }

  ;({ postsIds, commentsIds } = extractIds(rows))

  console.log(postsIds, commentsIds)
  addMessage(`[${file.name}] contains ${postsIds.length} posts, ${commentsIds.length} comments`)

  const postsInDb = new Set(postsIds.length > 0 ? await getItems(postsIds) : [])
  const commentsInDb = new Set(commentsIds.length > 0 ? await getItems(commentsIds) : [])

  if (postsInDb.size > 0) {
    addMessage(`Found ${postsInDb.size} posts in the database`)
  }
  if (commentsInDb.size > 0) {
    addMessage(`Found ${commentsInDb.size} comments in the database`)
  }

  const filteredPosts = postsIds.filter((id) => !postsInDb.has(id))
  const filteredComments = commentsIds.filter((id) => !commentsInDb.has(id))
  const items = filteredPosts.concat(filteredComments)

  addMessage(`${commentsInDb.size} new items`)
  if (items.length) {
    await fetchInfo(items)
  }
}
</script>

<template>
  <MainLayout>
    <main
      class="mx-auto grid max-w-screen-md grid-cols-[auto_1fr] grid-rows-[auto_1fr] bg-surface-50 text-dark dark:bg-surface-900 dark:text-light"
    >
      <div />
      <h2 class="mt-8 flex justify-center">
        <span>Import</span>
      </h2>
      <aside class="mr-auto px-4">
        <RateLimits />
      </aside>
      <div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
        <div>
          <label
            class="flex rounded-sm bg-primary-500 px-2.5 py-1.5 text-sm font-semibold text-light shadow-sm hover:bg-primary-600 dark:bg-primary-400 dark:text-surface-900 dark:hover:bg-primary-300"
          >
            <PhDownloadBold class="mr-2 h-5 w-5" />
            <span>Choose</span>
            <input type="file" class="hidden" accept=".json,.csv" @change="update" />
          </label>
        </div>
        <LogList />
      </div>
    </main>
  </MainLayout>
</template>

<style lang="postcss"></style>
