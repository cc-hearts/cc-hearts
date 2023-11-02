import { useRoute } from 'vue-router'

export function useIsArticlePages() {
  const route = useRoute()
  return route?.meta?.frontmatter
}
