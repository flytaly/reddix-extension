import { usePreferredDark } from '@vueuse/core'
import { optionsStorage } from '~/logic/browser-storage'

export function useThemeToggle() {
  const preferDark = usePreferredDark()

  const isDark = computed(() => {
    const theme = optionsStorage.value.theme
    return theme === 'auto' ? preferDark.value : theme === 'dark'
  })

  function toggleTheme() {
    optionsStorage.value.theme = isDark.value ? 'light' : 'dark'
  }

  return {
    isDark,
    toggleTheme,
  }
}
