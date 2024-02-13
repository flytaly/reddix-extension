import { describe, expect, it } from 'vitest'
import { extractIds } from './import-csv'

describe('Preprocess importing data', () => {
  it('saved items: get list of Reddit ids', () => {
    const data = [
      ['id', 'permalink'],
      [
        '19ery74',
        'https://www.reddit.com/r/dataisbeautiful/comments/19ery74/oc_darwin_award_recipients_per_country/', // posts
      ],
      [
        'kjfio7e',
        'https://www.reddit.com/r/dataisbeautiful/comments/19ery74/comment/kjfio7e/', //comment
      ],
      ['19fbwjw', 'https://www.reddit.com/r/Pikabu/comments/19fbwjw/иногда_нужно_просто_немного_поддержки/'], // unicode
    ]

    const result = extractIds(data)

    expect(result.postsIds).toEqual(['t3_19ery74', 't3_19fbwjw'])
    expect(result.commentsIds).toEqual(['t1_kjfio7e'])
    expect(result.category).toEqual('saved')
  })

  it('upvoted items: get list of Reddit ids', () => {
    const data = [
      ['id', 'permalink', 'direction'],
      [
        '19ery74',
        'https://www.reddit.com/r/dataisbeautiful/comments/19ery74/oc_darwin_award_recipients_per_country/',
        'up',
      ],
      [
        'kjfio7e',
        'https://www.reddit.com/r/dataisbeautiful/comments/19ery74/comment/kjfio7e/',
        'down',
      ],
      [
        'commentid',
        'https://www.reddit.com/r/subreddit/comments/id/comment/commentid/', 
        'up',
      ],
      ['19fbwjw', 'https://www.reddit.com/r/Pikabu/comments/19fbwjw/иногда_нужно_просто_немного_поддержки/', 'none'],
    ]

    const result = extractIds(data)

    expect(result.postsIds).toEqual(['t3_19ery74'])
    expect(result.commentsIds).toEqual(['t1_commentid'])
    expect(result.category).toEqual('upvoted')
  })
})
