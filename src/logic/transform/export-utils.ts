import type { DbRedditItem } from '../db'

const properties = [
  '_id', //
  '_created_at',
  '_updated_at',
  '_title_words',
  '_body_words',
  '_title_words',
] as const

export type ExportedItem = Omit<DbRedditItem, (typeof properties)[number]>

export function filterProperties(item: DbRedditItem): ExportedItem {
  const filtered: ExportedItem = {} as ExportedItem
  Object.keys(item).forEach((key) => {
    const keyName = key as keyof DbRedditItem
    // @ts-expect-error
    if (!properties.includes(keyName))
      // @ts-expect-error
      filtered[keyName] = item[keyName]
  })

  return filtered
}
