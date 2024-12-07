import { defineConfig } from 'vite'
import * as path from 'path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@atoms': path.resolve(__dirname, 'src/components/atoms/index'),
      '@context/*': path.resolve(__dirname, 'src/context/*'),
      '@electron-services/*': path.resolve(__dirname, 'electron/services/*'),
      '@electron/*': path.resolve(__dirname, 'electron/*'),
      '@features/*': path.resolve(__dirname, 'src/features/*'),
      '@molecules': path.resolve(__dirname, 'src/components/molecules/index'),
      '@organisms': path.resolve(__dirname, 'src/components/organisms/index'),
      '@services/*': path.resolve(__dirname, 'src/services/*'),
      '@store/*': path.resolve(__dirname, 'src/store/*'),
      '@styles/*': path.resolve(__dirname, 'src/styles/*'),
      '@templates/*': path.resolve(__dirname, 'src/templates/*'),
      '@test/*': path.resolve(__dirname, 'src/test/*'),
      '@types/*': path.resolve(__dirname, 'src/types/*'),
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
