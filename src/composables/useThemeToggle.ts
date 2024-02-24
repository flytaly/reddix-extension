import { usePreferredDark } from '@vueuse/core'
import { optionsStorage } from '~/logic/browser-storage'

export function useThemeToggle() {
  const preferDark = usePreferredDark()

  const isDark = computed(() => {
    const theme = optionsStorage.theme
    return theme === 'auto' ? preferDark.value : theme === 'dark'
  })

  function toggleTheme() {
    optionsStorage.theme = isDark.value ? 'light' : 'dark'
  }

  return {
    isDark,
    toggleTheme,
  }
}
