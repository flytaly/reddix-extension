import { SavedRedditItem, db } from '~/logic/db'
import { RedditItem, RedditItemResponse } from '~/reddit/reddit-types'

export async function deleteItems(ids: number[]) {
  return db.savedItems.bulkDelete(ids)
}

export async function updateItem(id: number, props: Partial<SavedRedditItem>) {
  return db.savedItems.update(id, props)
}

export async function upsertItems(items: RedditItem[]) {
  let savedNew = 0

  await db.transaction('rw', db.savedItems, async () => {
    const itemsInDB = await db.savedItems
      .where('name')
      .anyOf(items.map((item) => item.name))
      .toArray()

    const itemMap = {} as Record<string, SavedRedditItem>
    itemsInDB.forEach((item) => {
      itemMap[item.name] = item
    })

    const updated = items.map((item) => {
      if (itemMap[item.name]) {
        return { ...itemMap[item.name], ...item }
      }
      return item as SavedRedditItem
    })
    await db.savedItems.bulkPut(updated)

    savedNew = items.length - itemsInDB.length
  })

  return savedNew
}

export async function savePosts(listing: RedditItemResponse) {
  if (!listing?.data) {
    return
  }

  try {
    const items = listing.data.children.map((itm) => itm.data) as RedditItem[]
    const saved = await upsertItems(items)
    return saved
  } catch (error) {
    console.error(error)
  }
}
