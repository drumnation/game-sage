import { defineConfig } from 'vite'
import * as path from 'path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
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
    }
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          mode: command,
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
            minify: command === 'build',
            rollupOptions: {
              external: ['sharp', 'electron'],
              output: {
                format: 'commonjs'
              },
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
          resolve: {
            conditions: ['node']
          }
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          mode: command,
          build: {
            sourcemap: true,
            outDir: 'dist-electron',
            minify: command === 'build',
            rollupOptions: {
              output: {
                format: 'commonjs'
              }
            }
          },
          resolve: {
            conditions: ['node']
          }
        },
      },
      renderer: command === 'serve' ? {} : undefined,
    }),
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['electron'],
    }
  },
  base: process.env.ELECTRON == "true" ? './' : '.',
}))
