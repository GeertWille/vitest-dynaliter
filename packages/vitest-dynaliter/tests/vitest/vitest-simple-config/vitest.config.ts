import { join } from 'path'
import base from '../../../vitest.base'
import { mergeConfig, defineConfig } from 'vitest/config'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'simple',
      root: join(__dirname, '../..'),
      globals: true,
      env: {
        VITEST_DYNALITER_CONFIG_DIRECTORY: join(__dirname, '../..')
      },
      setupFiles: [join(__dirname, '../../setups/setupWithHooks.ts')]
    }
  })
)
