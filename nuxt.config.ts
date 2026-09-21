export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  css: ['~~/tokens.css', '~/assets/css/main.css'],
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || (process.env.NODE_ENV === 'production' ? '/cc-hearts/' : '/'),
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'carl',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'carl，前端工程师。我相信简单才是最好的用户体验。' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})
