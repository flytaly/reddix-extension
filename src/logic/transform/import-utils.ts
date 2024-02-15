import { IMPORT_TAKE } from '~/constants'
import { savePosts, upsertItems } from '~/logic/db/mutations'
import { getItems } from '~/logic/db/queries'
import { addMessage } from '~/logic/log-messages'
import { ExportedItem } from '~/logic/transform/export-utils'
import { csvStringToArray, extractIds } from '~/logic/transform/import-csv'
import { waitRateLimits } from '~/logic/wait-limits'
import { onRateLimits } from '~/reddit'
import { getItemsInfo } from '~/reddit/index'
import { type RateLimits } from '~/reddit/rate-limits'
import { DbRedditItem, isComment, isPost } from '../db'

export async function fetchInfo(ids: string[], category: ItemCategory = 'saved') {
  if (!ids.length) return
  addMessage(`Started getting information about the ${category} items`)
  const take = IMPORT_TAKE
  let rateLimits: RateLimits = {}
  const onRateLimitsWrap = (rl: RateLimits) => {
    rl = onRateLimits(rl)
    rateLimits = rl
    return rl
  }
  let imported = 0
  const idsSet = new Set(ids)
  let batch = ids.slice(0, take)
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
    const saved = (await savePosts(info, category)) || 0
    addMessage(`Added ${saved} items`)
    imported += saved
    batch = ids.slice(i, i + take)
  }
  addMessage(`The importing is finished (added ${imported} items)`)
  if (idsSet.size) {
    addMessage(`Could not get information about following items:  ${[...idsSet].map((v) => v.slice(3)).join(', ')}`)
  }
}

export async function parseCSV(file: File) {
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

  const { postsIds, commentsIds, category } = extractIds(rows)

  addMessage(`[${file.name}] contains ${postsIds.length} posts, ${commentsIds.length} comments`)

  const postsInDb = new Set(postsIds.length > 0 ? await getItems(postsIds) : [])
  const commentsInDb = new Set(commentsIds.length > 0 ? await getItems(commentsIds) : [])

  if (postsInDb.size > 0) {
    addMessage(`• ${postsInDb.size} existed posts in the database`)
  }
  if (commentsInDb.size > 0) {
    addMessage(`• ${commentsInDb.size} existed comments in the database`)
  }

  const filteredPosts = postsIds.filter((id) => !postsInDb.has(id))
  const filteredComments = commentsIds.filter((id) => !commentsInDb.has(id))
  const newItems = filteredPosts.concat(filteredComments)

  addMessage(`• ${newItems.length} new items`)
  return { newItems, category }
}

const commonProperties: Array<keyof RedditPostData & keyof RedditCommentData> = [
  'name',
  'permalink',
  'subreddit',
  'subreddit_name_prefixed',
]
const postProperties: Array<keyof RedditPostData> = ['selftext', 'title']
const commentProperties: Array<keyof RedditCommentData> = ['body']

function isValidItem(item: DbRedditItem) {
  const keys = Object.keys(item)
  if (commonProperties.some((k) => !keys.includes(k))) {
    console.log('not valid', item)
    return false
  }
  if (isPost(item as DbRedditItem)) {
    return postProperties.every((k) => keys.includes(k))
  }
  if (isComment(item as DbRedditItem)) {
    return commentProperties.every((k) => keys.includes(k))
  }
  return false
}

async function saveExportedItem(items: ExportedItem[]) {
  try {
    return (await upsertItems(items as DbRedditItem[])) || 0
  } catch (error) {
    console.error(error)
  }
  return 0
}

export async function importJSON(file: File) {
  const content = await file.text()
  const take = IMPORT_TAKE
  try {
    const data = JSON.parse(content) as ExportedItem[]
    let imported = 0
    let batch = data.slice(0, take)
    for (let i = take; batch.length; i += take) {
      batch = batch.filter((item) => isValidItem(item as DbRedditItem))
      const saved = await saveExportedItem(batch)
      imported += saved
      batch = data.slice(i, i + take)
    }
    addMessage(`The importing is finished (added ${imported} items)`)
  } catch (error) {
    addMessage(`[${file.name}] Invalid JSON file.`, 'error')
  }
}
