import { App, defineComponent } from 'vue'
import SideNav from './side'
import ImagePreviewVue from '@/components/preview/image-preview.vue'
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
        <ImagePreviewVue />
      </>
    )
  },
})

export default {
  install(app: App) {
    app.component('CcLayout', CcLayout)
  },
}
