import js from '@eslint/js'
// import pluginReact from 'eslint-plugin-react'
import reactPlugin from 'eslint-plugin-react'
import tseslint from "typescript-eslint";
import reactHooks from 'eslint-plugin-react-hooks'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: './client',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  reactPlugin.configs.flat.recommended,
  {
    ...reactPlugin.configs.flat['jsx-runtime'],
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },
  reactHooks.configs['recommended-latest'],
  tseslint.configs.recommended,
  eslintConfigPrettier,
])
