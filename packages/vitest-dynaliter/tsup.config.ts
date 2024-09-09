import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/setupHooks.ts', 'src/environmentHooks.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  config: 'tsconfig.build.json',
  sourcemap: true,
  clean: true,
  treeshake: true,
  // outExtension: () => ({ js: '.mjs' }),
  minify: true
})
