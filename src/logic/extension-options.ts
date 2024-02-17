export type Theme = 'auto' | 'dark' | 'light'

export type ExtensionOptions = {
  theme: Theme
}

export const defaultOptions: ExtensionOptions = {
  theme: 'auto',
}
