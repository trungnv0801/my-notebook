import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^react$'], ['^react'], ['^@?\\w'], ['^@'], ['^\\.'], ['^\\u0000']]
        }
      ]
    }
  },
  {
    files: [
      '**/module.config.ts',
      '**/module.registry.ts',
      '**/routes.tsx',
      '**/router.tsx',
      '**/auth-provider.tsx',
      '**/theme-provider.tsx'
    ],
    rules: {
      // These files intentionally export module wiring (lazy components,
      // contexts, registries) — fast refresh never applies to them.
      'react-refresh/only-export-components': 'off'
    }
  },
  eslintConfigPrettier
])
