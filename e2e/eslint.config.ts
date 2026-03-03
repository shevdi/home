import { fileURLToPath } from 'node:url'
import path from 'node:path'

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig } from 'eslint/config'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig([
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir,
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    ...js.configs.recommended,
  },
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  eslintConfigPrettier,
])
