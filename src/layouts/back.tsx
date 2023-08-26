import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'Back',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const goBack = () => router.go(-1)
    if (route.path === '/') return () => null
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
