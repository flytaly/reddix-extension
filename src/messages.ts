import type { BgState } from '~/background/bg-state'

// types derived from webext-bridge: https://github.com/serversideup/webext-bridge
interface ProtocolWithReturn<Data, Return> {
  data: Data
  return: Return
}

declare type DataTypeKey = keyof ProtocolMap
declare type GetDataType<K extends DataTypeKey> = K extends keyof ProtocolMap
  ? ProtocolMap[K] extends ProtocolWithReturn<infer Data, any>
    ? Data
    : ProtocolMap[K]
  : undefined
declare type GetReturnType<K extends DataTypeKey> = K extends keyof ProtocolMap
  ? ProtocolMap[K] extends ProtocolWithReturn<any, infer Return>
    ? Return
    : undefined
  : undefined

interface ProtocolMap {
  'fetch-items': ProtocolWithReturn<
    { username: string, category: ItemCategory, options?: { fetchAll?: boolean } },
    BgState
  >
  'get-state': ProtocolWithReturn<null, BgState>
  'state-update': BgState
  'clear-fetch-error': null
}

export function sendMessage<K extends DataTypeKey>(messageID: K, data?: GetDataType<K>): Promise<GetReturnType<K>> {
  return browser.runtime.sendMessage({ id: messageID, data })
}

export function onMessage<K extends DataTypeKey>(messageID: K, callback: (data: { data: GetDataType<K> }) => void) {
  return browser.runtime.onMessage.addListener((message: { id: K, data: GetDataType<K> }) => {
    if (message.id === messageID)
      callback({ data: message.data })
  })
}
