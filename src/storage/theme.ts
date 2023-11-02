import { THEME, THEME_KEY } from '@/configs'

export function setTheme(theme: THEME) {
  localStorage.setItem(THEME_KEY, theme)
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) as THEME
}

export function clearTheme() {
  localStorage.removeItem(THEME_KEY)
}
