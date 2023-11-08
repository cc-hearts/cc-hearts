import { ref } from 'vue'
import { useOnce } from './use-once'
import { THEME } from '@/configs/constants'
import { isBrowser } from '@/utils/valid'

export const useTheme = useOnce(() => {
  const themeRef = ref(THEME.LIGHT)

  const setTheme = (theme: THEME) => {
    themeRef.value = theme

    if (isBrowser()) {
      document.documentElement.classList.remove(THEME.DARK, THEME.LIGHT)
      document.documentElement.classList.add(theme)
    }
  }

  const toggleTheme = () => {
    const hasExistDarkCls = document.documentElement.classList.contains(
      THEME.DARK
    )
    const appendTheme = hasExistDarkCls ? THEME.LIGHT : THEME.DARK
    setTheme(appendTheme)
  }

  if (isBrowser()) {
    const classList = document.documentElement.classList
    setTheme(classList.contains(THEME.DARK) ? THEME.DARK : THEME.LIGHT)
  }

  return [themeRef, setTheme, toggleTheme] as const
})
