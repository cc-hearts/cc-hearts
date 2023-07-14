import { copy } from '@cc-heart/utils-client'
if (typeof window === 'object' && window !== null) {
  Reflect.set(window, '__copyCode', function (target) {
    const code = target.getAttribute('value')
    copy(code)
  })
}
