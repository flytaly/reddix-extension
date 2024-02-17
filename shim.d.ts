import type { ProtocolWithReturn } from 'webext-bridge'

declare global {
  export type ItemCategory = 'saved' | 'upvoted'
  export type ItemType = 'comment' | 'post'
  export type SearchDirection = 'asc' | 'desc'
  export type ViewType = 'list' | 'compact' | 'edit'
}

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'fetch-items': ProtocolWithReturn<
      { username: string; category: ItemCategory; options?: { fetchAll?: boolean } },
      BgState
    >
    'get-state': ProtocolWithReturn<null, BgState>
    'state-update': BgState
  }
}
