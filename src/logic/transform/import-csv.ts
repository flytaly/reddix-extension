import { RedditObjectKind } from '~/reddit/reddit-types'

// https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
export function csvStringToArray(strData: string) {
  const objPattern = new RegExp('(\\,|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\\,\\r\\n]*))', 'gi')
  let arrMatches = null
  const arrData = [[]] as string[][]
  // eslint-disable-next-line no-cond-assign
  while ((arrMatches = objPattern.exec(strData))) {
    if (arrMatches[1].length && arrMatches[1] !== ',')
      arrData.push([])
    const data = arrMatches[2] ? arrMatches[2].replace(new RegExp('""', 'g'), '"') : arrMatches[3]
    arrData[arrData.length - 1].push(data)
  }
  return arrData
}

// reddit.com/r/subreddit_name/comments/(postid)/post_name/(commentid)
const re = new RegExp(
  '.*reddit\\.com\\/'
  + 'r\\/\\w+\\/' // r/subreddit_name/
  + 'comments\\/(\\w+)\\/' // comments/postid/
  + '[^\\/]+\\/' // post_name/ or comment/ - post_name can contain unicode characters
  + '(\\w+)?', //  commentid
  'ui',
)

type VoteDirection = 'up' | 'down' | 'none'

export function extractIds(rows: string[][]) {
  const idIdx = rows[0].findIndex(col => col === 'id')
  const linkIdx = rows[0].findIndex(col => col === 'permalink')

  const voteDirectionIdx = rows[0].findIndex(col => col === 'direction')
  const category: ItemCategory = voteDirectionIdx === -1 ? 'saved' : 'upvoted'

  const postsIds = [] as string[]
  const commentsIds = [] as string[]

  rows.forEach((row) => {
    const id = row[idIdx]
    const permalink = row[linkIdx]
    const voteDir: VoteDirection | '' = category === 'upvoted' ? (row[voteDirectionIdx] as VoteDirection) : ''
    if (!id || !permalink)
      return
    if (category === 'upvoted' && voteDir !== 'up')
      return

    if (id.startsWith(`${RedditObjectKind.link}_`)) {
      postsIds.push(id)
      return
    }
    if (id.startsWith(`${RedditObjectKind.comment}_`)) {
      commentsIds.push(id)
      return
    }

    const match = permalink.match(re)
    if (!match || match.length !== 3)
      return
    const [, postId, commentId] = match
    if (commentId && commentId === id) {
      commentsIds.push(`${RedditObjectKind.comment}_${id}`)
      return
    }
    if (postId && postId === id)
      postsIds.push(`${RedditObjectKind.link}_${id}`)
  })

  return {
    postsIds,
    commentsIds,
    category,
  }
}
