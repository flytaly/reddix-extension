import { unescape } from 'lodash-es'
import { ImageSource, RedditCommentData, RedditItem, RedditObjectKind, RedditPostData } from './reddit-types'

export function isPostData(data: RedditItem): data is RedditPostData {
  return data.name.startsWith(RedditObjectKind.link)
}

export function isCommentData(data: RedditItem): data is RedditCommentData {
  return data.name.startsWith(RedditObjectKind.comment)
}

export type PostMedia = {
  thumbnail?: ImageSource | null
  source?: ImageSource | null
  video?: {
    url: string
    width: number
    height: number
  } | null
}

export function extractMedia(item: RedditItem): PostMedia {
  if (!isPostData(item)) {
    return {} as PostMedia
  }
  const source = item.preview?.images?.[0].source
  if (!source) return {}
  source.url = unescape(source.url)
  const result = { source, thumbnail: source, video: null } as PostMedia
  const resolutions = (item as RedditPostData).preview?.images?.[0].resolutions
  if (!resolutions) return result

  let thumbnail = resolutions.find((img) => {
    return img.width > 600 || img.height > 500
  })
  if (thumbnail) {
    thumbnail.url = unescape(thumbnail.url)
    result.thumbnail = thumbnail
  }

  if (item.is_video && item.media?.reddit_video) {
    result.video = {
      url: unescape(item.media.reddit_video.fallback_url),
      width: item.media.reddit_video.width,
      height: item.media.reddit_video.height,
    }
  }

  return result
}
