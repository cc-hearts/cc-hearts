import { defineComponent, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import Footer from './footer'
import Title from './title'
import SideNav from './side'
export default defineComponent({
  setup() {
    const router = useRouter()

    const BLOG_CLASS_NAME = 'max-blog-prose'
    const PROJECT_CLASS_NAME = 'max-full-blog-prose'

    const layoutClassNames = ref(BLOG_CLASS_NAME)
    watchEffect(() => {
      layoutClassNames.value =
        router.currentRoute.value.path === '/project'
          ? PROJECT_CLASS_NAME
          : BLOG_CLASS_NAME
    })

    return () => (
      <>
        <div class="m-auto flex">
          <section class={[layoutClassNames.value]}>
            <Title />
            <router-view />
          </section>
          <aside class="m-l-4 relative">
            <SideNav />
          </aside>
        </div>
        <Footer />
      </>
    )
  },
})
