import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'antd',
            '@ant-design/icons',
            '@mui/material',
            'styled-components'
          ]
        }
      }
    }
  },
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
})
