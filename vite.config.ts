import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import vueJsx from "@vitejs/plugin-vue-jsx";
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import LinkAttributes from 'markdown-it-link-attributes'
import Shiki from 'markdown-it-shiki'
import generateSitemap from 'vite-ssg-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({
    include: [/\.vue$/, /\.md$/]
  }),
  vueJsx(),
  UnoCSS(),
  Pages({
    dirs: "src/pages",
    extensions: ['vue', 'md'],
  }),
  Markdown({
    wrapperClasses: 'prose prose-sm m-auto text-left',
    headEnabled: true,
    markdownItSetup(md) {
      // https://prismjs.com/
      md.use(Shiki, {
        theme: {
          light: 'vitesse-light',
          dark: 'vitesse-dark',
        },
      })
      md.use(LinkAttributes, {
        matcher: (link: string) => /^https?:\/\//.test(link),
        attrs: {
          target: '_blank',
          rel: 'noopener',
        },
      })
    },
  }),
  ],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      reduceInlineStyles: false,
    },
    onFinished() { generateSitemap() },
  },
})
