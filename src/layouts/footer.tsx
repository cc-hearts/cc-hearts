import { defineComponent } from 'vue'

const Footer = defineComponent({
  setup() {
    return () => (
      <>
        <footer class={'cc-footer m-t-4 p-b-4'}>
          <p class={'text-center'}>
            Released under the{' '}
            <a
              class={'cc-footer__link'}
              href="https://creativecommons.org/licenses/by-nc-sa/4.0"
            >
              CC BY-NC-SA 4.0
            </a>
          </p>
          <p class={'text-center'}>Copyright © 2023-present</p>
        </footer>
      </>
    )
  },
})

export default Footer
