import { App, defineComponent } from 'vue'
import BackTop from '@/components/back-top/back-top.vue'
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
        <BackTop />
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
