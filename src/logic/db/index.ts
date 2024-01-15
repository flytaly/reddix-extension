// db.ts
import Dexie, { type Table } from 'dexie'
import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import { RedditObjectKind } from '~/reddit/reddit-types'

type DBProperties = {
  _title_words: string[]
  _body_words: string[]
  _id: number
  _tags: string[]
  _created_at: number
  _updated_at: number
}

export type SavedRedditPost = RedditPostData & DBProperties
export type SavedRedditComment = RedditCommentData & DBProperties
export type SavedRedditItem = SavedRedditPost | SavedRedditComment

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  savedItems!: Table<SavedRedditItem>

  constructor() {
    super('saved-items')
    this.version(1).stores({
      // Primary key and indexed props. 'name' is a reddit unique identifier startting with t1_, t2_, t3_...
      savedItems:
        '++_id, *_title_words, *_body_words, *_tags, &name, _created_at, _updated_at, author, subreddit, subreddit_name_prefixed, created_utc',
    })
  }
}

export const db = new MySubClassedDexie()

export function isPost(data: SavedRedditItem): data is SavedRedditPost {
  return data.name.startsWith(RedditObjectKind.link)
}

export function isComment(data: SavedRedditItem): data is SavedRedditComment {
  return data.name.startsWith(RedditObjectKind.comment)
}

// Add hooks that will index for full-text search:
db.savedItems.hook('creating', (_primKey, obj) => {
  if (isPost(obj) && typeof obj.title == 'string') {
    obj._title_words = tokenize(obj.title)
  }
  if (isPost(obj) && typeof obj.selftext == 'string') {
    obj._body_words = tokenize(obj.selftext)
  }
  if (isComment(obj) && typeof obj.body == 'string') {
    obj._body_words = tokenize(obj.body)
  }
  const ts = Math.floor(Date.now() / 1000)
  obj._created_at = ts
  obj._updated_at = ts
})

db.savedItems.hook('updating', (mods, _primKey, obj, _trans): Partial<SavedRedditItem> | undefined => {
  const updated = {} as Partial<SavedRedditItem>

  type P = Record<keyof SavedRedditPost, unknown>
  type C = Record<keyof SavedRedditComment, unknown>
  if (Object.prototype.hasOwnProperty.call(mods, 'title')) {
    updated._title_words = tokenizeProp((mods as P).title)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'selftext')) {
    updated._body_words = tokenizeProp((mods as P).selftext)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'body')) {
    updated._body_words = tokenizeProp((mods as C).body)
  }

  updated._updated_at = Math.floor(Date.now() / 1000)

  return {
    _body_words: updated._body_words || obj._body_words,
    _title_words: updated._title_words || obj._title_words,
  }
})

function tokenizeProp(property: unknown) {
  if (typeof property == 'string') {
    return tokenize(property)
  }
  //  property was deleted (typeof -> 'undefined') or changed to an unknown type. Remove indexes:
  return []
}

function tokenize(text: string): string[] {
  const allWordsIncludingDups = text.toLowerCase().split(' ')
  const wordSet = new Set(allWordsIncludingDups)
  return [...wordSet.keys()]
}
