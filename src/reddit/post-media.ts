import { unescape } from 'lodash-es'
import { isPostData } from '~/reddit'
import { ImageSource, RedditItem, RedditPostData } from './reddit-types'

export type GenericThumbnail = 'default' | 'nsfw' | 'spoiler' | 'self'

export type PostMedia = {
  thumbnail?: string | null
  source?: ImageSource | null
  generic?: GenericThumbnail
  video?: {
    url: string
    width: number
    height: number
  } | null
}

const minWidth = 150
const minHeight = 150

const isImageExt = (link?: string) => link && link.match(/(\.jpg|\.jpeg|\.png|\.gif|\.webp)$/)

function getMediaFromGallery(post: RedditPostData): PostMedia {
  const result = {} as PostMedia

  if (!post.media_metadata) return result

  const keys = Object.keys(post.media_metadata)
  const key = keys.find((key) => {
    const data = post.media_metadata?.[key]
    return data && data.s && (data.e === 'Image' || data.e === 'AnimatedImage')
  })
  if (!key) return result

  const media = post.media_metadata[key]
  if (media?.s) {
    result.source = {
      url: unescape(media.s.u),
      width: media.s.x,
      height: media.s.y,
    }
    let p = media.p?.find((p) => p.x > minWidth || p.y > minHeight)
    if (p) {
      result.thumbnail = unescape(p.u)
    }
  }

  return result
}

export function extractMedia(item: RedditItem): PostMedia {
  if (!isPostData(item)) {
    return {} as PostMedia
  }

  let result = {} as PostMedia

  if (item.thumbnail) {
    const thumbnail = unescape(item.thumbnail)
    if (thumbnail.startsWith('https')) {
      result.thumbnail = thumbnail
    } else {
      result.generic = thumbnail as GenericThumbnail
    }
  }

  const source = item.preview?.images?.[0].source
  if (source) {
    source.url = unescape(source.url)
    result.source = source
  }

  const resolutions = (item as RedditPostData).preview?.images?.[0].resolutions
  if (resolutions) {
    let thumbnail = resolutions.find((img) => {
      return img.width > minWidth || img.height > minHeight
    })
    if (thumbnail) {
      result.thumbnail = unescape(thumbnail.url)
    }
  }

  if (!result.thumbnail && isImageExt(item.url_overridden_by_dest)) {
    result.thumbnail = unescape(item.url_overridden_by_dest)
  }

  if (item.is_video && item.media?.reddit_video) {
    result.video = {
      url: unescape(item.media.reddit_video.fallback_url),
      width: item.media.reddit_video.width,
      height: item.media.reddit_video.height,
    }
  }

  if (item.is_gallery) {
    result = { ...result, ...getMediaFromGallery(item) }
  }

  return result
}
