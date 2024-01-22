import Dexie, { IndexableType, PromiseExtended } from 'dexie'
import { ITEMS_ON_PAGE } from '~/constants'
import { db } from '~/logic/db'
import { RedditObjectKind } from '~/reddit/reddit-types'

export type SearchQuery = {
  author: string
  hideComments: boolean
  hidePosts: boolean
  query: string
  subreddit: string
  tags: string[]
  title: string[]
  words: string[]
}

export async function getItems(ids: string[]) {
  const idsInDb = await db.savedItems.where('name').anyOf(ids).keys()
  return idsInDb as string[]
}

// with cursor based pagination
// https://dexie.org/docs/Collection/Collection.offset()#a-better-paging-approach
export async function getPostsFromDB(queryDetails: SearchQuery, lastId = 0, limit = ITEMS_ON_PAGE) {
  const { query } = queryDetails
  if (!query) {
    return db.savedItems
      .where('_id')
      .above(lastId)
      .filter(makeFilterFn(queryDetails)) //
      .limit(limit)
      .toArray()
  }
  const res = await find(queryDetails, { limit, lastId })
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
  details: SearchQuery,
  { lastId = 0, limit = ITEMS_ON_PAGE }: { lastId?: number; limit?: number } = {},
) {
  return db.transaction('r', db.savedItems, async () => {
    // Parallell search for all prefixes - just select resulting primary keys
    let dbQueries = [] as PromiseExtended<IndexableType[]>[]

    // words in title and body
    dbQueries = details.words.map((p) =>
      db.savedItems.where('_body_words').startsWith(p).or('_title_words').startsWith(p).primaryKeys(),
    )

    // title
    if (details.title.length != 0) {
      dbQueries.push(...details.title.map((t) => db.savedItems.where('_title_words').startsWith(t).primaryKeys()))
    }

    // tags
    if (details.tags.length != 0) {
      dbQueries.push(...details.tags.map((t) => db.savedItems.where('_tags').equals(t).primaryKeys()))
    }

    // author
    if (details.author) {
      dbQueries.push(db.savedItems.where('author').startsWithIgnoreCase(details.author).primaryKeys())
    }

    // subreddit
    if (details.subreddit) {
      dbQueries.push(db.savedItems.where('subreddit').startsWithIgnoreCase(details.subreddit).primaryKeys())
    }

    const results = await Dexie.Promise.all(dbQueries)

    if (results.length === 0) {
      return []
    }

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
