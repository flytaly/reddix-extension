import type { ProtocolWithReturn } from 'webext-bridge'

declare global {
  export type ItemCategory = 'saved' | 'upvoted'
}

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'fetch-items': ProtocolWithReturn<{ username: string; category: ItemCategory }, BgState>
    'get-state': ProtocolWithReturn<null, BgState>
    'state-update': BgState
  }
}
