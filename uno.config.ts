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
    ['max-blog-prose', { 'max-width': '70ch' }],
    ['min-blog-prose', { 'min-width': '45ch' }],
    [
      'cc-footer',
      {
        color: 'var(--color-text-3)',
        'border-top': '1px solid var(--divider-color)',
      },
    ],
  ],
})
