import { defineConfig } from 'vite'
import * as path from 'path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
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
