import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Back',
  setup() {
    const router = useRouter()
    const goBack = () => {
      router.go(-1)
    }
    return () => (
      <div class="cc-back m-y-5">
        <div onClick={goBack}>
          <span class="whitespace-pre">cd .. </span>
        </div>
      </div>
    )
  },
})
