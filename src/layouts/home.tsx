import { defineComponent } from 'vue'
import Footer from './footer'
import Title from './title'
export default defineComponent({
  setup() {
    return () => (
      <>
        <main class="max-blog-prose m-auto w-full cc">
          <Title />
          <router-view />
        </main>
        <Footer />
      </>
    )
  },
})
