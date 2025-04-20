import type { SearchQuery } from './db/queries'
import { describe, expect, it } from 'vitest'
import { search, setAuthor, setSearchQuery, setSubreddit, setTag } from './search-store'

function create(s: Partial<SearchQuery> = {}) {
  return { query: '', tags: [], words: [], author: '', hidePosts: false, hideComments: false, ...s } as SearchQuery
}

describe('search store', () => {
  describe('parse query', () => {
    it('words', () => {
      const query = 'Hello World'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['hello', 'world'] }))
    })

    it('tags #', () => {
      const query = '#hello world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, tags: ['hello'], words: ['world'] }))
    })

    it('author:', () => {
      const query = '#hello author:name world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, tags: ['hello'], words: ['world'], author: 'name' }))
    })

    it('author u/', () => {
      const query = '#hello u/name world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, tags: ['hello'], words: ['world'], author: 'name' }))
    })

    it('title:', () => {
      const query = 'title:Hello world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['world'], title: ['hello'] }))
    })

    it('title t:', () => {
      const query = 't:Hello world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['world'], title: ['hello'] }))
    })

    it('body:', () => {
      const query = 'Hello body:world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['hello'], body: ['world'] }))
    })

    it('body b:', () => {
      const query = 'Hello b:world'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['hello'], body: ['world'] }))
    })

    it('subreddit:', () => {
      const query = 'subreddit:Damnthatsinteresting hello'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['hello'], subreddit: 'Damnthatsinteresting' }))
    })

    it('subreddit r/', () => {
      const query = 'r/Damnthatsinteresting hello'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['hello'], subreddit: 'Damnthatsinteresting' }))
    })

    it('escape', () => {
      const query = '\\r/sub \\#Hello World'
      setSearchQuery(query)
      expect(search).toMatchObject(create({ query, words: ['r/sub', '#hello', 'world'] }))
    })
  })

  describe('methods', () => {
    it('should add tag to input', () => {
      document.body.innerHTML = '<input id="search-input" />'
      const input = document.getElementById('search-input')
      expect(document.activeElement === input).toBe(false)
      setTag('tag')
      expect(search).toMatchObject(create({ query: '#tag ', tags: ['tag'] }))
      expect(document.activeElement === input).toBe(true)
    })

    it('should add subreddit to input', () => {
      document.body.innerHTML = '<input id="search-input" />'
      const input = document.getElementById('search-input')
      expect(document.activeElement === input).toBe(false)
      setSubreddit('subreddit')
      expect(search).toMatchObject(create({ query: 'r/subreddit ', subreddit: 'subreddit' }))
      expect(document.activeElement === input).toBe(true)
    })

    it('should add author to input', () => {
      document.body.innerHTML = '<input id="search-input" />'
      const input = document.getElementById('search-input')
      expect(document.activeElement === input).toBe(false)
      setAuthor('username')
      expect(search).toMatchObject(create({ query: 'u/username ', author: 'username' }))
      expect(document.activeElement === input).toBe(true)
    })
  })
})
