import { App, defineComponent } from 'vue'
import SideNav from './side'
import '@/assets/pages/layout.scss'
const CcLayout = defineComponent({
  props: {
    frontmatter: {
      type: [String, Object],
      default: '',
    },
  },
  setup(_, { slots }) {
    return () => (
      <>
        {slots.default?.()}
        <SideNav />
      </>
    )
  },
})

export default {
  install(app: App) {
    app.component('CcLayout', CcLayout)
  },
}
