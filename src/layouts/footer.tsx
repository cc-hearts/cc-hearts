import { defineComponent } from 'vue'
import '@/assets/pages/footer.scss'
import { useRoute } from 'vue-router'
const Footer = defineComponent({
  setup() {
    const router = useRoute()
    return () =>
      router.path === '/' ? null : (
        <footer class={'cc-footer max-blog-prose m-auto m-t-10 w-full p-b-6'}>
          <a
            class={'cc-footer__link'}
            href="https://creativecommons.org/licenses/by-nc-sa/4.0"
          >
            CC BY-NC-SA 4.0
          </a>
          <span class={'m-x-0.5em'}>2023-present ©</span>
          <a class={'cc-footer__link'} href="https://www.github.com/cc-hearts">
            cc heart
          </a>
        </footer>
      )
  },
})

export default Footer
