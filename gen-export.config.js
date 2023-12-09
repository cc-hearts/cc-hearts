import { defineConfig } from '@cc-heart/gen-index-export'

export default defineConfig({
  dirs: [
    { path: 'src/hooks', output: 'src/hooks/index.ts' },
    { path: 'src/icons', output: 'src/icons/index.ts' },
  ],
})
