import type { DbRedditItem } from '~/logic/db'
import type { WrappedItem } from '~/logic/wrapped-item'

import { db } from '~/logic/db'

export type RedditItemWithCategory = RedditItem & { _category?: ItemCategory[] }

export async function deleteItems(ids: number[]) {
  return db.redditItems.bulkDelete(ids)
}

export async function updateItem(id: number, props: Partial<DbRedditItem>) {
  return db.redditItems.update(id, props)
}

function merge(updatedItem: RedditItemWithCategory, dbItem?: DbRedditItem): DbRedditItem {
  if (!dbItem)
    return updatedItem as DbRedditItem

  const concat = dbItem._category.concat(updatedItem._category || [])
  return { ...dbItem, ...updatedItem, _category: Array.from(new Set(concat)) }
}

export async function upsertItems(items: RedditItemWithCategory[]) {
  let savedNew = 0

  await db.transaction('rw', db.redditItems, async () => {
    const itemsInDB = await db.redditItems
      .where('name')
      .anyOf(items.map(item => item.name))
      .toArray()

    const itemMap = {} as Record<string, DbRedditItem>
    itemsInDB.forEach((item) => {
      itemMap[item.name] = item
    })

    const updated = items.map(item => merge(item, itemMap[item.name]))

    await db.redditItems.bulkPut(updated)

    savedNew = items.length - itemsInDB.length
  })

  return savedNew
}

export async function savePosts(rawItems: Array<RedditPostUnfiltered | RedditComment>, category: ItemCategory = 'saved') {
  if (!rawItems?.length)
    return

  try {
    const items = rawItems.map((itm) => {
      return { ...itm.data, _category: [category] }
    }) as RedditItemWithCategory[]
    const saved = await upsertItems(items)
    return saved
  }
  catch (error) {
    console.error(error)
  }
}

export async function addTags(
  ids: WrappedItem['dbId'][],
  newTags: string[],
  onUpdate?: (updates: Record<number, string[]>) => void,
) {
  const set = new Set(newTags)
  const updates: Record<number, string[]> = {}
  try {
    await db.redditItems
      .where('_id')
      .anyOf(ids)
      .modify((item) => {
        const prevTags = item._tags || []
        const union = new Set([...prevTags, ...set])
        item._tags = Array.from(union)
        updates[item._id] = Array.from(union)
      })
    onUpdate?.(updates)
  }
  catch (error) {
    console.error('Update tags', error)
  }
}

export async function removeTag(
  ids: WrappedItem['dbId'][],
  removedTag: string,
  onUpdate?: (updates: Record<number, string[]>) => void,
) {
  try {
    const upd: Record<number, string[]> = {}

    await db.redditItems
      .where('_id')
      .anyOf(ids)
      .modify((item) => {
        const prevTags = item._tags || []
        item._tags = prevTags.filter(tag => tag !== removedTag)
        upd[item._id] = item._tags
      })

    onUpdate?.(upd)
  }
  catch (error) {
    console.error('Update tags', error)
  }
}

export async function editTags(
  id: WrappedItem['dbId'],
  newTags: string[],
  onUpdate?: (updates: Record<number, string[]>) => void,
) {
  try {
    const upd: Record<number, string[]> = {}

    await db.redditItems
      .where('_id')
      .equals(id)
      .modify((item) => {
        item._tags = [...newTags]
        upd[item._id] = item._tags
      })

    onUpdate?.(upd)
  }
  catch (error) {
    console.error('Edit tags', error)
  }
}
