function copy(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
    return
  }
  console.warn('clipboard is not exist of navigator')
}
if (typeof window === 'object' && window !== null) {
  Reflect.set(window, '__copyCode', function (target) {
    let code = target.getAttribute('value')
    if (code) {
      code = decodeURIComponent(atob(code))
      console.log(code)

      copy(code)
    }
  })
}
