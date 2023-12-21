import Dexie from 'dexie'
import { ITEMS_ON_PAGE } from '~/constants'
import { db } from '~/logic/db'
import { RedditObjectKind } from '~/reddit/reddit-types'

export type SearchQuery = {
  query: string
  hidePosts: boolean
  hideComments: boolean
}
// with cursor based pagination
// https://dexie.org/docs/Collection/Collection.offset()#a-better-paging-approach
export async function getPostsFromDB(queryDetails: SearchQuery, lastId = 0, limit = ITEMS_ON_PAGE) {
  const { query } = queryDetails
  // TODO: handle errors
  if (!query) {
    return db.savedItems
      .where('_id')
      .above(lastId)
      .filter(makeFilterFn(queryDetails)) //
      .limit(limit)
      .toArray()
  }
  const res = await find(
    query.split(' ').map((s) => s.toLowerCase().trim()),
    queryDetails,
    { limit, lastId },
  )
  return res
}

type RedditItemWithName = { name: string }

function makeFilterFn(details: SearchQuery) {
  return (item: RedditItemWithName) => {
    if (details.hidePosts) {
      return !item.name.startsWith(RedditObjectKind.link)
    }
    if (details.hideComments) {
      return !item.name.startsWith(RedditObjectKind.comment)
    }

    return true
  }
}

export function find(
  prefixes: string[],
  details: SearchQuery,
  { lastId = 0, limit = ITEMS_ON_PAGE }: { lastId?: number; limit?: number } = {},
) {
  return db.transaction('r', db.savedItems, async () => {
    // Parallell search for all prefixes - just select resulting primary keys
    const results = await Dexie.Promise.all(
      prefixes.map((prefix) =>
        db.savedItems.where('_body_words').startsWith(prefix).or('_title_words').startsWith(prefix).primaryKeys(),
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
        // pagination
        if (item._id <= lastId) {
          return false
        }
        return true
      })
      .sortBy('_id')

    return items.slice(0, limit)
  })
}
