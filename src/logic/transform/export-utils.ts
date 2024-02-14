import { SavedRedditItem } from '../db'

const properties = [
  '_id', //
  '_created_at',
  '_updated_at',
  '_title_words',
  '_body_words',
  '_title_words',
] as const

export type ExportedItem = Omit<SavedRedditItem, (typeof properties)[number]>

export function filterProperties(item: SavedRedditItem): ExportedItem {
  const filtered: ExportedItem = {} as ExportedItem
  Object.keys(item).forEach((key) => {
    const keyName = key as keyof SavedRedditItem
    // @ts-ignore
    if (!properties.includes(keyName)) {
      // @ts-ignore
      filtered[keyName] = item[keyName]
    }
  })

  return filtered
}
