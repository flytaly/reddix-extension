import { SearchQuery } from './db/queries'

export const search = reactive<SearchQuery>({
  query: '',
  tags: [],
  words: [],
  author: '',
  title: [],
  hidePosts: false,
  hideComments: false,
})

export function clearSearch() {
  search.query = ''
  search.tags = []
  search.words = []
  search.author = ''
  search.title = []
}

export function setSearchQuery(query: string) {
  const pieces = query.split(' ')
  clearSearch()
  for (let piece of pieces) {
    if (piece.startsWith('\\')) {
      // escape
      search.words.push(piece.slice(1).toLowerCase())
      continue
    }
    if (piece.startsWith('#')) {
      search.tags.push(piece.slice(1))
      continue
    }
    if (piece.startsWith('author:')) {
      search.author = piece.slice(7)
      continue
    }
    if (piece.startsWith('title:')) {
      search.title.push(piece.slice(6).toLowerCase())
      continue
    }
    search.words.push(piece.toLowerCase())
  }
  search.query = query
}

function focusInput() {
  const input = document.getElementById('search-input')
  if (input) input.focus()
}

export function setTag(tag: string) {
  clearSearch()
  search.tags = [tag]
  search.query = '#' + tag + ' '
  focusInput()
}
