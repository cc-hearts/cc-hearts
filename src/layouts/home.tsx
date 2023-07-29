import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => (
      <main class="max-blog-prose min-blog-prose m-auto">
        <router-view />
      </main>
    )
  },
})
