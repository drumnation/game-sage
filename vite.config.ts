import { defineConfig } from 'vite'
import * as path from 'path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@atoms': path.resolve(__dirname, './src/components/atoms'),
      '@components': path.resolve(__dirname, './src/components'),
      '@electron': path.resolve(__dirname, './electron'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@main': path.resolve(__dirname, './src/main'),
      '@molecules': path.resolve(__dirname, './src/components/molecules'),
      '@organisms': path.resolve(__dirname, './src/components/organisms'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@renderer': path.resolve(__dirname, './src/renderer'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@test': path.resolve(__dirname, './src/test'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['sharp'],
              plugins: [
                commonjs({
                  dynamicRequireTargets: [
                    'node_modules/sharp/**/*.node',
                    '@img/sharp-darwin-arm64/sharp.node',
                    '@img/sharp-wasm32/sharp.node'
                  ],
                })
              ]
            }
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
          },
        },
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  build: {
    sourcemap: true,
  },
})
