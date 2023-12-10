import type { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'fetch-saved': ProtocolWithReturn<{ username: string }, BgState>
    'get-state': ProtocolWithReturn<null, BgState>
    'state-update': BgState
  }
}
