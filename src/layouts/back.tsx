import { useIsArticlePages } from '@/hooks/use-is-article-pages'
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Back',
  setup() {
    const router = useRouter()
    const goBack = () => router.go(-1)
    if (!useIsArticlePages()) return () => null
    return () => (
      <div class="cc-back m-y-5">
        <span class="m-r-2">&gt;</span>
        <span class="whitespace-pre" onClick={goBack}>
          cd ..
        </span>
      </div>
    )
  },
})
