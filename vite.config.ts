import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Pages from 'vite-plugin-pages'
import Markdown from 'vite-plugin-vue-markdown'
import LinkAttributes from 'markdown-it-link-attributes'
import anchor from 'markdown-it-anchor'
import Shiki from 'markdown-it-shiki'
import generateSitemap from 'vite-ssg-sitemap'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import codeCopy from './plugins/markdown-it-code-copy.cjs'
import matter from 'gray-matter'
import toc from 'markdown-toc'
import type { Slug } from './src/types/types'
import { generatorRightSide } from './plugins/generator-right-side'
import { isDraftPath } from './scripts/draft'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    vueJsx(),
    UnoCSS(),
    Pages({
      dirs: ['src/pages', 'draft'],
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
