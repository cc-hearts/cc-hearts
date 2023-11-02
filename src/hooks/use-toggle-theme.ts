import { setTheme } from '@/storage'
import { useTheme } from '.'

export function useToggleTheme() {
  const [themeRef, , toggleTheme] = useTheme()
  toggleTheme()
  setTheme(themeRef.value)
}
