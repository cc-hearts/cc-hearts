import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { readFileSync } from 'fs'
import matter from 'gray-matter'
import anchor from 'markdown-it-anchor'
import LinkAttributes from 'markdown-it-link-attributes'
import Shiki from 'markdown-it-shiki'
import toc from 'markdown-toc'
import { resolve } from 'path'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import generateSitemap from 'vite-ssg-sitemap'
import { generatorRightSide } from './plugins/gen-right-side/generator-right-side'
import codeCopy from './plugins/markdown-copy/markdown-it-code-copy.cjs'
import { defineReadTime } from './plugins/read-time/read-time'
import { isDraftPath } from './scripts/draft'
import type { Slug } from './src/types/types'
import { removeH1Header } from './plugins/header/remove-h1-header'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'remove-upgrade-insecure-requests',
      transformIndexHtml(html: string) {
        const reg = /<meta\b[^>]*content="upgrade-insecure-requests"[^>]*>/gm
        return html.replace(reg, '')
      },
    },
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    UnoCSS(),
    Pages({
      dirs: ['src/pages', 'draft', 'src/techs'],
      extensions: ['vue', 'md'],
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1))
        if (route.path !== '/' && path.endsWith('.md')) {
          const md = readFileSync(path)
          const { data, content } = matter(md.toString())
          route.meta = Object.assign(route.meta || {}, {
            frontmatter: {
              ...data,
              isDraft: isDraftPath(path),
              time: data.date || new Date().toISOString().split('T')[0],
            },
            slug: generatorRightSide(
              (toc(content, {}) as unknown as { json: Slug }).json
            ),
            readTime: defineReadTime(content),
          })
        }
        return route
      },
    }),
    Markdown({
      wrapperClasses: 'prose prose-sm m-auto text-left',
      wrapperComponent: 'CcLayout',
      headEnabled: true,
      markdownItSetup(md) {
        md.use(codeCopy)
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
            class: 'cc-link',
            target: '_blank',
            rel: 'noopener',
          },
        })
        md.use(anchor, {
          permalink: anchor.permalink.linkInsideHeader({
            symbol: `
              <span aria-hidden="true">§</span>
            `,
            placement: 'before',
          }),
        })

        md.use(removeH1Header)
      },
    }),
  ],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    crittersOptions: {
      reduceInlineStyles: false,
    },
    onFinished() {
      generateSitemap()
    },
  },
})
