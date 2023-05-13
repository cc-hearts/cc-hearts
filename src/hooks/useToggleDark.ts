export function useToggleDark() {
  const el = document.documentElement
  const token = el.classList
  const hasDarkClassName = token.contains('dark')
  localStorage.setItem('theme', hasDarkClassName ? 'light' : 'dark')
  if (hasDarkClassName) {
    token.remove('dark')
  } else {
    token.add('dark')
  }
}
