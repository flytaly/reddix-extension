// db.ts
import Dexie, { type Table } from 'dexie'
import { RedditObjectKind } from '~/reddit/reddit-types'

export type DbOnlyProperties = {
  _title_words: string[]
  _body_words: string[]
  _id: number
  _tags: string[]
  _created_at: number
  _updated_at: number
  _category: ItemCategory[]
}

export type DbRedditPost = RedditPostData & DbOnlyProperties
export type DbRedditComment = RedditCommentData & DbOnlyProperties
export type DbRedditItem = DbRedditPost | DbRedditComment

export class MySubClassedDexie extends Dexie {
  // The store is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  redditItems!: Table<DbRedditItem>

  constructor() {
    super('reddit-items')
    this.version(1).stores({
      // Primary key and indexed props.
      redditItems:
        // 'name' is a reddit unique identifier startting with t1_, t2_, t3_...
        '++_id, *_title_words, *_body_words, *_tags, &name, _created_at, _updated_at, *_category, author, subreddit, created_utc',
    })
  }
}

export const db = new MySubClassedDexie()

export function isPost(data: DbRedditItem): data is DbRedditPost {
  return data.name.startsWith(RedditObjectKind.link)
}

export function isComment(data: DbRedditItem): data is DbRedditComment {
  return data.name.startsWith(RedditObjectKind.comment)
}

// Add hooks that will index for full-text search:
db.redditItems.hook('creating', (_primKey, obj) => {
  if (isPost(obj) && typeof obj.title == 'string') {
    obj._title_words = tokenize(obj.title)
  }
  if (isPost(obj) && typeof obj.selftext == 'string') {
    obj._body_words = tokenize(obj.selftext)
  }
  if (isComment(obj) && typeof obj.body == 'string') {
    obj._body_words = tokenize(obj.body)
  }
  if (!obj._category?.length) {
    obj._category = ['saved']
  }

  obj.subreddit = obj.subreddit?.toLowerCase()

  const ts = Math.floor(Date.now() / 1000)
  obj._created_at = ts
  obj._updated_at = ts
})

db.redditItems.hook('updating', (mods, _primKey, obj, _trans): Partial<DbRedditItem> | undefined => {
  const updated = {} as Partial<DbRedditItem>

  type P = Partial<DbRedditPost>
  type C = Partial<DbRedditComment>
  if (Object.prototype.hasOwnProperty.call(mods, 'title')) {
    updated._title_words = tokenizeProp((mods as P).title)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'selftext')) {
    updated._body_words = tokenizeProp((mods as P).selftext)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'body')) {
    updated._body_words = tokenizeProp((mods as C).body)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'subreddit')) {
    updated.subreddit = (mods as P | C).subreddit?.toLowerCase()
  }

  updated._updated_at = Math.floor(Date.now() / 1000)

  return {
    _body_words: updated._body_words || obj._body_words,
    _title_words: updated._title_words || obj._title_words,
    subreddit: updated.subreddit || obj.subreddit,
  }
})

function tokenizeProp(property: unknown) {
  if (typeof property == 'string') {
    return tokenize(property)
  }
  //  property was deleted (typeof -> 'undefined') or changed to an unknown type. Remove indexes:
  return []
}

// https://www.regular-expressions.info/unicode.html
export const separator = /[\p{Z}\p{S}\p{P}\p{C}$]+/u

function tokenize(text: string): string[] {
  const allWordsIncludingDups = text.toLowerCase().split(separator)
  const wordSet = new Set(allWordsIncludingDups)
  return [...wordSet.keys()]
}
