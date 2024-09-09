import { join } from 'path'
import base from '../../../vitest.base'
import { mergeConfig, defineConfig } from 'vitest/config'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'advanced-config',
      root: join(__dirname, '../..'),
      globals: true,
      setupFiles: [
        join(__dirname, '../../setups/setupAdvanced.ts'),
        join(__dirname, '../../setups/setupAdvancedEnv.ts')
      ]
    }
  })
)
