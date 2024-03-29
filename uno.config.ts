import { defineConfig, presetAttributify, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetAttributify({
      /* preset options */
    }),
    presetUno(),
    // ...custom presets
    presetIcons({
      collections: {
        carbon: () =>
          import('@iconify-json/carbon').then((i) => i.icons as any),
      },
    }),
  ],
  rules: [
    ['max-blog-prose', { 'max-width': '75ch' }],
    ['max-full-blog-prose', { 'max-width': '100ch' }],
    [
      'cc-footer',
      {
        color: 'var(--color-text-3)',
      },
    ],
  ],
})
