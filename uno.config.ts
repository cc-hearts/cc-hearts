import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify({ /* preset options */ }),
    presetUno(),
    // ...custom presets
  ],
  rules: [
    ['max-blog-prose', { 'max-width': '70ch' }]
  ]
})