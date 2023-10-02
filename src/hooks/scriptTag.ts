export function useScriptTag(src: string, node: HTMLElement) {
  const scriptTag = document.createElement('script')
  scriptTag.src = src
  scriptTag.async = true
  const el = node || document.body
  el.appendChild(scriptTag)
}
