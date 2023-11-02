export function useOnce<T>(fn: (...args: any[]) => T) {
  let isOnce = false
  let __cached: any = null
  return function (): T {
    if (!isOnce) {
      isOnce = true
      __cached = fn()
    }
    return __cached
  }
}
