function copy(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    return
  }
  console.warn('clipboard is not exist of navigator')
}
if (typeof window === 'object' && window !== null) {
  Reflect.set(window, '__copyCode', function (target) {
    const disabled = target.getAttribute('disabled')
    if (disabled) return
    let code = target.getAttribute('value')
    if (code) {
      code = decodeURIComponent(atob(code))
      target.classList.add('copy-btn-copied')
      target.setAttribute('disabled', 'true')
      copy(code)
      setTimeout(() => {
        target.classList.remove('copy-btn-copied')
        target.removeAttribute('disabled')
      }, 1000)
    }
  })
}
