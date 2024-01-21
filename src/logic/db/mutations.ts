import { db } from '~/logic/db'

export async function removeItems(ids: number[]) {
  return db.savedItems.bulkDelete(ids)
}
