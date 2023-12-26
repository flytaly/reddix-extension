import { reactive } from 'vue'
import type { SearchQuery } from './db/queries'

export const search = reactive<SearchQuery>({
  query: '',
  hidePosts: false,
  hideComments: false,
  tags: [],
  words: [],
  author: '',
})
