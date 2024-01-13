import { db } from '~/logic/db'

export async function exportItems() {
  const items: SavedRedditItem[] = []
  await db.savedItems.each((obj) => {
    items.push(obj)
  })
  const blob = new Blob([JSON.stringify(items)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'export.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
