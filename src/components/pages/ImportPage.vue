<script setup lang="ts">
import MainLayout from '~/components/pages/MainLayout.vue'
import PhDownloadBold from '~icons/ph/upload-bold'
import RateLimitsBlock from '~/components/RateLimitsBlock.vue'
import LogList from '~/components/LogList.vue'
import { extractIds, csvStringToArray } from '~/logic/import'
import { addMessage } from '~/logic/log-messages'
import { getItems, savePosts } from '~/logic/db/queries'
import { getItemsInfo } from '~/reddit/index'
import { IMPORT_TAKE } from '~/constants'
import { onRateLimits } from '~/reddit'
import { type RateLimits } from '~/reddit/rate-limits'
import { waitRateLimits } from '~/logic/wait-limits'

let postsIds = [] as string[]
let commentsIds = [] as string[]

async function fetchInfo(ids: string[]) {
  if (!ids.length) return
  addMessage(`Started getting information about the posts`)
  const take = IMPORT_TAKE
  let batch = ids.slice(0, take)
  let rateLimits: RateLimits = {}
  const onRateLimitsWrap = (rl: RateLimits) => {
    rl = onRateLimits(rl)
    rateLimits = rl
    return rl
  }
  let imported = 0
  const idsSet = new Set(ids)
  for (let i = take; batch.length; i += take) {
    await waitRateLimits(rateLimits, (msg: string) => addMessage(msg))
    const [info, error] = await getItemsInfo(batch, onRateLimitsWrap)
    if (error) {
      addMessage(`Error: ${error}`, 'error')
      return
    }
    if (!info) {
      return
    }
    info.data.children.forEach((item) => idsSet.delete(item.data?.name))
    const saved = (await savePosts(info)) || 0
    addMessage(`Added ${saved} items`)
    imported += saved
    batch = ids.slice(i, i + take)
  }
  addMessage(`The importing is finished (added ${imported} items)`)
  if (idsSet.size) {
    addMessage(`Could not get information about following items:  ${[...idsSet].map((v) => v.slice(3)).join(', ')}`)
  }
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

  addMessage(`${items.length} new items`)

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
        <RateLimitsBlock />
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
