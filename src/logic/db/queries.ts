import Dexie, { Collection, IndexableType, PromiseExtended } from 'dexie'
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
  body: string[]
  sortBy?: 'created' | 'id' | 'subreddit'
  direction?: SearchDirection
}

export async function getItems(ids: string[]) {
  const idsInDb = await db.redditItems.where('name').anyOf(ids).keys()
  return idsInDb as string[]
}

function getSortKeys(sortBy: SearchQuery['sortBy'], lastItem?: WrappedItem | null) {
  switch (sortBy) {
    case 'created':
      return { index: 'created_utc', cursor: lastItem?.item.created_utc } as const
    case 'subreddit':
      return { index: 'subreddit', cursor: lastItem?.item.subreddit } as const
    default:
      return { index: '_id', cursor: lastItem?.dbId } as const
  }
}

function getCollectionAfter(q: SearchQuery, lastItem?: WrappedItem | null): Collection<DbRedditItem, IndexableType> {
  const { index, cursor } = getSortKeys(q.sortBy, lastItem)
  const isDesc = q.direction === 'desc'

  if (!cursor) {
    return isDesc ? db.redditItems.orderBy(index).reverse() : db.redditItems.orderBy(index)
  }

  const where = db.redditItems.where(index)

  // unique index
  if (index === '_id') {
    return isDesc //
      ? where.below(cursor).reverse()
      : where.above(cursor)
  }

  // non-unique indexes
  return isDesc ? where.belowOrEqual(cursor).reverse() : where.aboveOrEqual(cursor)
}

// with cursor based pagination
// https://dexie.org/docs/Collection/Collection.offset()#a-better-paging-approach
export async function getPostsFromDB(
  queryDetails: SearchQuery,
  pagination: PaginationDetails = {},
): Promise<WrappedItem[]> {
  const { query } = queryDetails
  const { lastItem, limit = ITEMS_ON_PAGE } = pagination
  if (!query) {
    const items = await getCollectionAfter(queryDetails, lastItem)
      .filter(makeFilterFn(queryDetails, lastItem)) //
      .limit(limit)
      .toArray()

    return items.map((item) => new WrappedItem(item))
  }
  const res = await find(queryDetails, pagination)
  return res.map((item) => new WrappedItem(item))
}

function makeFilterFn(details: SearchQuery, lastItem?: WrappedItem | null) {
  /** Check for items with non-unique indexes */
  let isOldItem: (item: DbRedditItem) => boolean = () => false

  if (lastItem && details.sortBy !== 'id') {
    const { index } = getSortKeys(details.sortBy, lastItem)

    isOldItem = (item: DbRedditItem) => {
      if (item[index] !== lastItem.item[index]) {
        return false
      }
      return details.direction === 'desc' ? item._id >= lastItem.dbId : item._id <= lastItem.dbId
    }
  }

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

    if (isOldItem(item)) {
      return false
    }

    return true
  }
}

// if prefix ends with \, search as it's a whole word
function havePrefix(indexes: string[], p: string) {
  const isPrefix = !p.endsWith('\\')
  if (!isPrefix) {
    p = p.slice(0, -1)
  }
  let collection = isPrefix
    ? db.redditItems.where(indexes[0]).startsWith(p)
    : db.redditItems.where(indexes[0]).equals(p)
  for (let i = 1; i < indexes.length; i++) {
    collection = isPrefix ? collection.or(indexes[i]).startsWith(p) : collection.or(indexes[i]).equals(p)
  }
  return collection.primaryKeys()
}

function makePaginationFilter<T extends DbRedditItem>(
  details: SearchQuery,
  lastItem?: WrappedItem | null,
): (item: T) => boolean {
  const { index, cursor } = getSortKeys(details.sortBy, lastItem)

  if (!cursor) return () => true

  if (index === '_id') {
    return details.direction === 'desc' //
      ? (item: T) => item[index] < cursor
      : (item: T) => item[index] > cursor
  }

  return details.direction === 'desc' //
    ? (item: T) => item[index] <= cursor
    : (item: T) => item[index] >= cursor
}

export function find(details: SearchQuery, { lastItem, limit = ITEMS_ON_PAGE }: PaginationDetails = {}) {
  const paginationFilter = makePaginationFilter(details, lastItem)
  const { index: sortIndexKey } = getSortKeys(details.sortBy, lastItem)

  const filter = makeFilterFn(details, lastItem)

  return db.transaction('r', db.redditItems, async () => {
    // Parallell search for all prefixes - just select resulting primary keys
    let dbQueries = [] as PromiseExtended<IndexableType[]>[]

    dbQueries = details.words.map((p) => havePrefix(['_body_words', '_title_words'], p))

    // title
    if (details.title.length != 0) {
      dbQueries.push(...details.title.map((p) => havePrefix(['_title_words'], p)))
    }

    // body
    if (details.body.length != 0) {
      dbQueries.push(...details.body.map((p) => havePrefix(['_body_words'], p)))
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
        if (!paginationFilter(item)) {
          return false
        }
        return filter(item)
      })

    if (details.direction === 'desc') {
      collection = collection.reverse()
    }

    const items = await collection.sortBy(sortIndexKey)

    return items.slice(0, limit)
  })
}
