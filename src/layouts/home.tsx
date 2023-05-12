import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    return () => (<main class="px-4 py-10 max-w-prose m-auto text-gray-700 dark:text-gray-200">
      <router-view />
    </main>)
  }
})