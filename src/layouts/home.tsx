import { defineComponent } from 'vue'
import Footer from './footer'
export default defineComponent({
  setup() {
    return () => (
      <>
        <main class="max-blog-prose min-blog-prose m-auto">
          <router-view />
        </main>
        <Footer />
      </>
    )
  },
})
