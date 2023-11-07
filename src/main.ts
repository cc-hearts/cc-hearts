import '@/assets/scss/reset.scss'
import '@/assets/scss/theme.scss'
import Card from './components/card/card.vue'
import 'uno.css'
import { ViteSSG } from 'vite-ssg'
import routes from '~pages'
import '../plugins/markdown-copy/copy-code-event.js'
import '../plugins/markdown-copy/markdown-it-code-copy.scss'
import App from './App.vue'
import { __DEV__ } from './configs'
import { useInitTheme } from './hooks'
import LayoutInstance from './layouts/layout'
import './main.scss'

useInitTheme()

if (__DEV__) console.log(routes)

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.component('Card', Card)
  app.use(LayoutInstance)
})
