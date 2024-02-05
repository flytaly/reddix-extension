import { unescape } from 'lodash-es'
import { SavedRedditItem, SavedRedditPost } from '~/logic/db/index'
import { isPostData } from '~/reddit'
import { PostMedia, extractMedia } from '~/reddit/post-media'
import { RedditCommentData, RedditPostData } from '~/reddit/reddit-types'

export class WrappedItem {
  item: SavedRedditItem
  media: PostMedia

  constructor(item: SavedRedditItem) {
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
    return (this.item as RedditPostData).title || (this.item as RedditCommentData).link_title
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
    return (this.item as SavedRedditPost).is_video || this.media.video
  }

  get isGallery() {
    return (this.item as SavedRedditPost).is_gallery
  }

  get hasBody() {
    return (this.item as RedditPostData).selftext_html || (this.item as RedditCommentData).body_html
  }

  get isLink() {
    return (this.item as SavedRedditPost).post_hint == 'link' && !this.hasBody && this.url
  }

  get url() {
    return (this.item as SavedRedditPost).url || ''
  }

  set tags(newTags: string[]) {
    this.item._tags = newTags
  }

  get tags() {
    return this.item._tags
  }

  update(updates: Partial<SavedRedditItem>) {
    Object.assign(this.item, updates)
  }

  clone() {
    return new WrappedItem(this.item)
  }
}
