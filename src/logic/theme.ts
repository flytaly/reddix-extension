import { optionsStorage } from '~/logic/browser-storage'
import { Theme } from '~/logic/extension-options'

const matchDark = () => window.matchMedia('(prefers-color-scheme: dark)')

export function setClass(theme: Theme) {
  let isDark = false
  if (theme == 'dark' || (theme === 'auto' && matchDark().matches)) {
    isDark = true
  }
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export async function setupTheme() {
  watch(() => optionsStorage.theme, setClass, { immediate: true })

  matchDark().addEventListener('change', async () => {
    setClass(optionsStorage.theme)
  })
}
