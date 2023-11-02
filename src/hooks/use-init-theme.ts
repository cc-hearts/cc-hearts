import { getTheme } from '@/storage'
import { useTheme } from './use-theme'
import { THEME } from '@/configs'

export function useInitTheme() {
  if (typeof document !== 'undefined') {
    const transition = document.body.style.transition
    document.body.style.transition = 'none'
    const [, setThemeRef] = useTheme()
    setThemeRef(getTheme() === THEME.DARK ? THEME.DARK : THEME.LIGHT)
    document.body.offsetHeight // 回流
    document.body.style.transition = transition
  }
}
