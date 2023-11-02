import App from './App.vue'
import 'uno.css'
import { ViteSSG } from 'vite-ssg'
import '@/assets/scss/theme.scss'
import '@/assets/scss/reset.scss'
import '../plugins/markdown-copy/markdown-it-code-copy.scss'
import '../plugins/markdown-copy/copy-code-event.js'
import './main.scss'
import routes from '~pages'
import { useInitTheme } from './hooks'
import { __DEV__ } from './configs'
import LayoutInstance from './layouts/layout'
import Card from '@/components//card/card.vue'

useInitTheme()

if (__DEV__) console.log(routes)

export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  app.component('Card', Card)
  app.use(LayoutInstance)
})
