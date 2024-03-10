export type Theme = 'auto' | 'dark' | 'light'

export type ExtensionOptions = {
  theme: Theme
  autoUpdateSaved: boolean
  autoUpdateUpvoted: boolean
  updateInterval: number
  onBadgeClick?: '' | 'openNewTab'
}

export const defaultOptions: ExtensionOptions = {
  theme: 'auto',
  autoUpdateSaved: false,
  autoUpdateUpvoted: false,
  updateInterval: 1000 * 60 * 60 * 8,
  onBadgeClick: '',
}
