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

  get title() {
    return unescape((this.item as RedditPostData).title || (this.item as RedditCommentData).link_title)
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
    return (this.item as SavedRedditPost).is_gallery
  }

  get isGallery() {
    return (this.item as SavedRedditPost).is_gallery
  }

  get tags() {
    return this.item._tags
  }
}
