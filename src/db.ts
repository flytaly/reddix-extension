// db.ts
import Dexie, { type Table } from 'dexie'
import type { RedditItem } from '~/reddit/reddit-types'

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  items!: Table<RedditItem>

  constructor() {
    super('reddit-items')
    this.version(1).stores({
      items: '++id, title, selftext', // Primary key and indexed props
    })
  }
}

export const db = new MySubClassedDexie()
