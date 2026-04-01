import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

export default defineConfig({
  esbuild: {
    keepNames: true,
  },
  plugins: [
    react(),
    dts({
      include: ['src'],
      rollupTypes: true,
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'shevdiUiKit',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-calendar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-label',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-slot',
        '@radix-ui/react-toast',
      ],
      output: {
        assetFileNames: 'ui-kit[extname]',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
})
