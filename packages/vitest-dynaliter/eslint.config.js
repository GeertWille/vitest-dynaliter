// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended'
import tslintparser from '@typescript-eslint/parser'
import globals from 'globals'

export default tseslint.config(
  {
    extends: [ ...tseslint.configs.recommended, eslintConfigPrettier],
    files: ['src/**', 'tests/**'],
    ignores: ['node_modules/**', '**/dist/**', 'tests/configs/**', '**/*.config.js'],
    languageOptions: {
      parser: tslintparser,
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        project: 'tsconfig.eslint.json'
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true
        }
      ]
    }
  },
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', '**/dist/**', 'tests/configs/**', '**/*.config.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  }
)
