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
      savedItems: '++name, author, subreddit, subreddit_name_prefixed, created_utc, *title_words, *body_words', // Primary key and indexed props
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
db.savedItems.hook('creating', (primKey, obj) => {
  if (isPost(obj) && typeof obj.title == 'string') {
    obj.title_words = getAllWords(obj.title)
  }
  if (isPost(obj) && typeof obj.selftext == 'string') {
    obj.body_words = getAllWords(obj.selftext)
  }
  if (isComment(obj) && typeof obj.body == 'string') {
    obj.body_words = getAllWords(obj.body)
  }
})

// TODO: add updating hook

function getAllWords(text: string): string[] {
  const allWordsIncludingDups = text.split(' ')
  const wordSet = new Set(allWordsIncludingDups)
  return [...wordSet.keys()]
}
