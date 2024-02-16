import Dexie, { IndexableType, PromiseExtended, WhereClause } from 'dexie'
import { ITEMS_ON_PAGE } from '~/constants'
import { DbRedditItem, db } from '~/logic/db'
import { RedditObjectKind } from '~/reddit/reddit-types'
import { WrappedItem } from '../wrapped-item'

export type PaginationDetails = {
  lastItem?: WrappedItem | null
  limit?: number
}

export type SearchQuery = {
  author: string
  hideComments?: boolean
  hidePosts?: boolean
  hideSaved?: boolean
  hideUpvoted?: boolean
  query: string
  subreddit: string
  tags: string[]
  title: string[]
  words: string[]
  direction?: SearchDirection
}

export async function getItems(ids: string[]) {
  const idsInDb = await db.redditItems.where('name').anyOf(ids).keys()
  return idsInDb as string[]
}

function getCollection(where: WhereClause<DbRedditItem, IndexableType>, id: number, q: SearchQuery) {
  if (q.direction === 'desc') {
    return where.below(id || Infinity).reverse()
  }
  return where.above(id)
}

// with cursor based pagination
// https://dexie.org/docs/Collection/Collection.offset()#a-better-paging-approach
export async function getPostsFromDB(
  queryDetails: SearchQuery,
  pagination: PaginationDetails = {},
): Promise<WrappedItem[]> {
  const { query } = queryDetails
  const { lastItem, limit = ITEMS_ON_PAGE } = pagination
  const lastId = lastItem?.dbId || 0
  if (!query) {
    const where = db.redditItems.where('_id')
    const items = await getCollection(where, lastId, queryDetails)
      .filter(makeFilterFn(queryDetails)) //
      .limit(limit)
      .toArray()

    return items.map((item) => new WrappedItem(item))
  }
  const res = await find(queryDetails, { limit, lastId })
  return res.map((item) => new WrappedItem(item))
}

function makeFilterFn(details: SearchQuery) {
  return (item: DbRedditItem) => {
    if (details.hideSaved && item._category.includes('saved')) {
      return false
    }
    if (details.hideUpvoted && item._category.includes('upvoted')) {
      return false
    }
    if (details.hidePosts && item.name.startsWith(RedditObjectKind.link)) {
      return false
    }
    if (details.hideComments && item.name.startsWith(RedditObjectKind.comment)) {
      return false
    }

    return true
  }
}

export function find(
  details: SearchQuery,
  { lastId = 0, limit = ITEMS_ON_PAGE }: { lastId?: number; limit?: number } = {},
) {
  let pagination = (item: DbRedditItem) => item._id > lastId
  if (details.direction === 'desc') {
    lastId = lastId || Infinity
    pagination = (item: DbRedditItem) => item._id < lastId
  }
  const filter = makeFilterFn(details)

  return db.transaction('r', db.redditItems, async () => {
    // Parallell search for all prefixes - just select resulting primary keys
    let dbQueries = [] as PromiseExtended<IndexableType[]>[]

    // words in title and body
    dbQueries = details.words.map((p) =>
      db.redditItems.where('_body_words').startsWith(p).or('_title_words').startsWith(p).primaryKeys(),
    )

    // title
    if (details.title.length != 0) {
      dbQueries.push(...details.title.map((t) => db.redditItems.where('_title_words').startsWith(t).primaryKeys()))
    }

    // tags
    if (details.tags.length != 0) {
      dbQueries.push(...details.tags.map((t) => db.redditItems.where('_tags').equals(t).primaryKeys()))
    }

    // author
    if (details.author) {
      dbQueries.push(db.redditItems.where('author').startsWithIgnoreCase(details.author).primaryKeys())
    }

    // subreddit
    if (details.subreddit) {
      dbQueries.push(db.redditItems.where('subreddit').startsWithIgnoreCase(details.subreddit).primaryKeys())
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

    let collection = db.redditItems
      .where(':id')
      .anyOf(reduced)
      .filter((item) => {
        if (!pagination(item)) {
          return false
        }
        return filter(item)
      })

    if (details.direction === 'desc') {
      collection = collection.reverse()
    }

    const items = await collection.sortBy('_id')

    return items.slice(0, limit)
  })
}
