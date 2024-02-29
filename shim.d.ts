import type { ProtocolWithReturn } from 'webext-bridge'

declare global {
  export type ItemCategory = 'saved' | 'upvoted'
  export type ItemType = 'comment' | 'post'
  export type SearchDirection = 'asc' | 'desc'
  export type ViewType = 'list' | 'compact' | 'edit'
}
