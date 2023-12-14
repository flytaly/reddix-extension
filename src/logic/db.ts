// db.ts
import Dexie, { type Table } from 'dexie'
import type { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'
import { RedditObjectKind } from '~/reddit/reddit-types'

export type SavedRedditPost = RedditPostData & { title_words: string[]; body_words: string[] }
export type SavedRedditComment = RedditCommentData & { title_words: string[]; body_words: string[] }
export type SavedRedditItem = SavedRedditPost | SavedRedditComment

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  savedItems!: Table<SavedRedditItem>

  constructor() {
    super('saved-items')
    this.version(1).stores({
      // Primary key and indexed props. 'name' is a reddit unique identifier startting with t1_, t2_, t3_...
      savedItems: '++, &name, author, subreddit, subreddit_name_prefixed, created_utc, *title_words, *body_words',
    })
  }
}

export const db = new MySubClassedDexie()

function isPost(data: SavedRedditItem): data is SavedRedditPost {
  return data.name.startsWith(RedditObjectKind.link)
}

function isComment(data: SavedRedditItem): data is SavedRedditComment {
  return data.name.startsWith(RedditObjectKind.comment)
}

// Add hooks that will index for full-text search:
db.savedItems.hook('creating', (_primKey, obj) => {
  if (isPost(obj) && typeof obj.title == 'string') {
    obj.title_words = tokenize(obj.title)
  }
  if (isPost(obj) && typeof obj.selftext == 'string') {
    obj.body_words = tokenize(obj.selftext)
  }
  if (isComment(obj) && typeof obj.body == 'string') {
    obj.body_words = tokenize(obj.body)
  }
})

db.savedItems.hook('updating', (mods, _primKey, obj, _trans): Partial<SavedRedditItem> | undefined => {
  const updated = {} as Partial<SavedRedditItem>

  type P = Record<keyof SavedRedditPost, unknown>
  type C = Record<keyof SavedRedditComment, unknown>
  if (Object.prototype.hasOwnProperty.call(mods, 'title')) {
    updated.title_words = tokenizeProp((mods as P).title)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'selftext')) {
    updated.body_words = tokenizeProp((mods as P).selftext)
  }
  if (Object.prototype.hasOwnProperty.call(mods, 'body')) {
    updated.body_words = tokenizeProp((mods as C).body)
  }

  return {
    body_words: updated.body_words || obj.body_words,
    title_words: updated.title_words || obj.title_words,
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

export function find(prefixes: string[]) {
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

    return db.savedItems.where(':id').anyOf(reduced).toArray()
  })
}
