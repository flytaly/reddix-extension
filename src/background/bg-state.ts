export type BgState = {
  isFetching: boolean
  fetchError: string | null
  loaded: number
  savedNew: number
}

export const state: BgState = {
  isFetching: false,
  fetchError: '',
  loaded: 0,
  savedNew: 0,
}
