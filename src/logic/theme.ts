type Theme = 'auto' | 'dark' | 'light'

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

async function getThemeFromStorage(): Promise<Theme> {
  return (await browser.storage.local.get('theme')).theme || 'auto'
}

export async function setupTheme() {
  browser.storage.onChanged.addListener((changes) => {
    if (!changes.theme?.newValue) return
    const nextTheme = changes.theme.newValue as 'auto' | 'dark' | 'light'
    setClass(nextTheme)
  })

  const theme = await getThemeFromStorage()
  setClass(theme)

  matchDark().addEventListener('change', async () => {
    const theme = await getThemeFromStorage()
    setClass(theme)
  })
}
