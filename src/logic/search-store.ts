import { SearchQuery } from './db/queries'

export const search = reactive<SearchQuery>({
  author: '',
  hideComments: false,
  hidePosts: false,
  query: '',
  subreddit: '',
  tags: [],
  title: [],
  words: [],
})

export function clearSearch() {
  search.query = ''
  search.tags = []
  search.words = []
  search.author = ''
  search.title = []
  search.subreddit = ''
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
    if (piece.startsWith('u/')) {
      search.author = piece.slice(2)
      continue
    }
    if (piece.startsWith('title:')) {
      search.title.push(piece.slice(6).toLowerCase())
      continue
    }
    if (piece.startsWith('subreddit:')) {
      search.subreddit = piece.slice(10)
      continue
    }
    if (piece.startsWith('r/')) {
      search.subreddit = piece.slice(2)
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
