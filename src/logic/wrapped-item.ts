import { unescape } from 'lodash-es'
import type { DbRedditItem, DbRedditPost } from '~/logic/db/index'
import { isPostData } from '~/reddit'
import type { PostMedia } from '~/reddit/post-media'
import { extractMedia } from '~/reddit/post-media'

export class WrappedItem {
  item: DbRedditItem
  media: PostMedia

  constructor(item: DbRedditItem) {
    this.item = item
    this.media = extractMedia(this.item)
  }

  get dbId() {
    return this.item._id
  }

  get redditId() {
    return this.item.name
  }

  get title() {
    if (isPostData(this.item))
      return (this.item as RedditPostData).title

    return this.item.link_title || `${unescape(this.item.body).slice(0, 50)}...`
  }

  get body() {
    const text = (this.item as RedditPostData).selftext_html || (this.item as RedditCommentData).body_html
    return unescape(text)
  }

  get fullLink() {
    return `https://reddit.com${this.item.permalink}`
  }

  get itemType() {
    return isPostData(this.item) ? 'post' : 'comment'
  }

  get isVideo() {
    return (this.item as DbRedditPost).is_video || this.media.video
  }

  get isGallery() {
    return (this.item as DbRedditPost).is_gallery
  }

  get hasBody() {
    return (this.item as RedditPostData).selftext_html || (this.item as RedditCommentData).body_html
  }

  get isLink() {
    return (this.item as DbRedditPost).post_hint === 'link' && !this.hasBody && this.url
  }

  get url() {
    return (this.item as DbRedditPost).url || ''
  }

  set tags(newTags: string[]) {
    this.item._tags = newTags
  }

  get tags() {
    return this.item._tags || []
  }

  update(updates: Partial<DbRedditItem>) {
    Object.assign(this.item, updates)
  }

  clone() {
    return new WrappedItem(this.item)
  }
}
