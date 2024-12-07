import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import App from './App'
import './index.css'
import { ElectronProvider } from './context/ElectronContext'

if (!window.electronAPI) {
  throw new Error('Electron API not found. This app must be run in Electron.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ElectronProvider value={{ api: window.electronAPI }}>
        <App />
      </ElectronProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
