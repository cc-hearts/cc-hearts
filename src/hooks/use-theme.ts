import { ref } from 'vue'
import { useOnce } from './use-once'
import { THEME } from '@/configs/constants'

export const useTheme = useOnce(() => {
  const classList = document.documentElement.classList
  const themeRef = ref(
    classList.contains(THEME.DARK) ? THEME.DARK : THEME.LIGHT
  )
  const setTheme = (theme: THEME) => {
    themeRef.value = theme
    document.documentElement.classList.remove(THEME.DARK, THEME.LIGHT)
    document.documentElement.classList.add(theme)
  }
  const toggleTheme = () => {
    const hasExistDarkCls = document.documentElement.classList.contains(
      THEME.DARK
    )
    const appendTheme = hasExistDarkCls ? THEME.LIGHT : THEME.DARK
    setTheme(appendTheme)
  }
  return [themeRef, setTheme, toggleTheme] as const
})

export default useTheme
