import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: __dirname,
    exclude: ['/node_modules/', '/e2e/', '/src/'],
    coverage: {
      exclude: ['/tests/', '/__testdir__/'],
      include: ['<rootDir>/src/**/*.ts', '!<rootDir>/**/*.js'],
      provider: 'v8',
      reporter: ['json', 'json-summary', 'lcov', 'text', 'text-summary', 'clover'],
      enabled: false
    }
  }
})
