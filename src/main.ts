import App from './App.vue'
import 'uno.css'
import { ViteSSG } from 'vite-ssg'
import '@/assets/scss/theme.scss'
import './main.css'
import routes from '~pages'

console.log(routes);
export const createApp = ViteSSG(App, { routes })

// Object.entries(import.meta.glob('./modules/*.ts', { eager: true })).forEach(([, Module]) => {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   Module.setup?.({ app, routes })
// })