import App from './App.vue'
import 'uno.css'
import { ViteSSG } from 'vite-ssg'
import '@/assets/scss/theme.scss'
import '@/assets/scss/reset.scss'
import './main.scss'
import routes from '~pages'
import { useInitTheme } from './hooks'
import { __DEV__ } from './configs'
useInitTheme()

if (__DEV__) {
  console.log(routes);
}
export const createApp = ViteSSG(App, { routes })
// Object.entries(import.meta.glob('./modules/*.ts', { eager: true })).forEach(([, Module]) => {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   Module.setup?.({ app, routes })
// })
