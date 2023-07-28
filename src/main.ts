import App from './App.vue'
import 'uno.css'
import { ViteSSG } from 'vite-ssg'
import '@/assets/scss/theme.scss'
import '@/assets/scss/reset.scss'
import '../plugins/markdown-it-code-copy.scss'
import '../plugins/copy-code-event'
import './main.scss'
import routes from '~pages'
import { useInitTheme } from './hooks'
import { __DEV__ } from './configs'
import LayoutInstance from './layouts/layout'
useInitTheme()

if (__DEV__) console.log(routes)

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.use(LayoutInstance)
})
