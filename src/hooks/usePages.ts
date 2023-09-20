import { useRoute } from 'vue-router'

export function useIsPages() {
  const route = useRoute()
  return route?.meta?.frontmatter
}
