export type ImageSource = {
  height: number
  width: number
  url: string
}

export type VideoSource = {
  fallback_url: string
  has_audio: boolean
  height: number
  width: number
  scrubber_media_url: string
  dash_url: string
  duration: number
  hls_url: string
  is_gif: boolean
  transcoding_status: string
}

export type LiteralUnion<LiteralType, BaseType> = LiteralType | (BaseType & Record<never, never>)

export type MediaMedataPreview = {
  /** width */
  x: number
  /** height */
  y: number
  /** url */
  u: string
}

export type MediaMetadata = {
  status: LiteralUnion<'valid', string>
  id: string
  e: LiteralUnion<'Image' | 'RedditVideo' | 'AnimatedImage', string>
  /** image/gif, image/png .... */
  m?: string
  /** preview list */
  p?: MediaMedataPreview[]
  /** source */
  s?: MediaMedataPreview
}

export type RedditPostData = {
  author: string
  created_utc: number
  created: number
  id: string
  link_flair_text?: string | null
  name: string
  over_18?: boolean
  permalink: string
  thumbnail?: string
  preview?: {
    images: Array<{
      id: string
      resolutions?: ImageSource[]
      source?: ImageSource
    }>
  }
  saved: boolean
  selftext?: string
  selftext_html?: string
  subreddit: string
  subreddit_name_prefixed: string
  title: string
  url: string
  is_gallery?: boolean
  media?: {
    reddit_video?: VideoSource
  }
  is_video?: boolean
  media_metadata?: Record<string, MediaMetadata>
}

export type RedditCommentData = {
  author: string
  author_fullname: string
  author_is_blocked: boolean
  body: string
  body_html: string
  created: number
  created_utc: number
  id: string
  link_id: string
  link_permalink: string
  link_title: string
  name: string
  over_18: boolean
  permalink: string
  saved: boolean
  subreddit: string
  subreddit_name_prefixed: string
}

// https://www.reddit.com/dev/api/
export enum RedditObjectKind {
  'comment' = 't1',
  'account' = 't2',
  'link' = 't3',
  'message' = 't4',
  'subreddit' = 't5',
  'award' = 't6',
}

export type RedditPost = {
  kind: RedditObjectKind.link
  data: RedditPostData
}

export type RedditPostUnfiltered = RedditPost & {
  kind: RedditObjectKind.link
  data: RedditPostData & Record<string, unknown>
}

export type RedditComment = {
  kind: RedditObjectKind.comment
  data: RedditCommentData
}

export type RedditItem = RedditCommentData | RedditPostData

export type RedditListingResponse<T> = {
  kind: 'Listing'
  data: {
    /** after / before - only one should be specified. these indicate the fullname of an item in the listing to use as the anchor point of the slice. */
    after?: string | null
    before?: string | null
    children: T[]
    dist?: number
    geo_filter?: string
    modhash?: string | null
  }
}

export type RedditError = {
  error?: string
  message?: string
}

export type RedditItemResponse = RedditListingResponse<RedditPostUnfiltered | RedditComment>

export type RedditListingRequest = {
  after?: number
  /** after / before - only one should be specified. these indicate the fullname of an item in the listing to use as the anchor point of the slice */
  before?: number
  /**  the maximum number of items to return in this slice of the listing */
  limit?: number
  /**   the number of items already seen in this listing. on the html site, the builder uses this to determine when to give values for before and after in the response. */
  count?: number
  /**  optional parameter; if all is passed, filters such as "hide links that I have voted on" will be disabled. */
  show?: 'all'
  /** expand subreddits */
  sr_detail?: boolean
}
