export function useInitTheme() {
  if (typeof document !== 'undefined') {
    const classList = document.documentElement.classList
    document.body.style.transition = 'none'
    localStorage.getItem('theme') === 'dark'
      ? classList.add('dark')
      : classList.remove('dark')
    document.body.offsetHeight // 回流
    document.body.style.transition = ''
  }
}
