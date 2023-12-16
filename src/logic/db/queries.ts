import Dexie, { Collection, IndexableType, Table } from 'dexie'
import { ITEMS_ON_PAGE } from '~/constants'
import { db } from '~/logic/db'
import { RedditObjectKind } from '~/reddit/reddit-types'

export type SearchQuery = {
  query: string
  hidePosts: boolean
  hideComments: boolean
}

export async function getPostsFromDB(queryDetails: SearchQuery, offset = 0, limit = ITEMS_ON_PAGE) {
  const { query } = queryDetails
  // TODO: handle errors
  if (!query) {
    const collection = filterItemTypes(db.savedItems, queryDetails)
    return collection.offset(offset).limit(limit).toArray()
  }
  const res = await find(
    query.split(' ').map((s) => s.toLowerCase().trim()),
    queryDetails,
    { limit, offset },
  )
  return res
}

function filterItemTypes<T>(table: Table<T, IndexableType>, details: SearchQuery): Collection<T, IndexableType> {
  const { hidePosts, hideComments } = details
  let collection: Collection<T, IndexableType> | undefined
  if (hidePosts) {
    collection = table.where('name').startsWith(RedditObjectKind.comment)
  }
  if (hideComments) {
    collection = table.where('name').startsWith(RedditObjectKind.link)
  }

  return collection || table.toCollection()
}

export function find(
  prefixes: string[],
  details: SearchQuery,
  { offset = 0, limit = 100 }: { offset?: number; limit?: number } = {},
) {
  return db.transaction('r', db.savedItems, async () => {
    // Parallell search for all prefixes - just select resulting primary keys
    const results = await Dexie.Promise.all(
      prefixes.map((prefix) =>
        db.savedItems.where('body_words').startsWith(prefix).or('title_words').startsWith(prefix).primaryKeys(),
      ),
    )

    // Intersect result set of primary keys
    const reduced = results.reduce((a, b) => {
      const set = new Set(b)
      return a.filter((k) => set.has(k))
    })

    const items = await db.savedItems
      .where(':id')
      .anyOf(reduced)
      .filter((item) => {
        if (details.hidePosts) {
          return !item.name.startsWith(RedditObjectKind.link)
        }
        if (details.hideComments) {
          return !item.name.startsWith(RedditObjectKind.comment)
        }
        return true
      })
      .sortBy(':id')

    return items.slice(offset, offset + limit)
  })
}
