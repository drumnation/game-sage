import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { ScreenshotService } from './services/screenshot/ScreenshotService'
import { HotkeyService } from '../src/electron/services/hotkey/HotkeyService'
import type { ScreenshotConfig } from './services/screenshot/types'
import type { HotkeyConfig } from '../src/electron/services/hotkey/types'

const DIST_PATH = path.join(__dirname, '../dist')

let mainWindow: BrowserWindow | null = null
let screenshotService: ScreenshotService | null = null
let hotkeyService: HotkeyService | null = null

const WINDOW_WIDTH = 1200
const WINDOW_HEIGHT = 800

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#141414',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(DIST_PATH, 'index.html'))
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

function setupScreenshotService() {
  screenshotService = new ScreenshotService();

  screenshotService.on('frame', (result) => {
    if (mainWindow) {
      mainWindow.webContents.send('capture-frame', {
        imageData: result.buffer.toString('base64'),
        metadata: result.metadata,
      });
    }
  });

  screenshotService.on('error', (error: Error) => {
    if (mainWindow) {
      mainWindow.webContents.send('main-process-message', {
        message: `Screenshot error: ${error.message}`,
        timestamp: Date.now(),
      });
    }
  });

  ipcMain.handle('start-capture', async () => {
    try {
      await screenshotService?.start();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('stop-capture', async () => {
    try {
      screenshotService?.stop();
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('capture-now', async () => {
    try {
      const results = await screenshotService?.captureNow();
      return {
        success: true,
        data: {
          frames: results?.map(result => ({
            imageData: result.buffer.toString('base64'),
            metadata: result.metadata,
          })),
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('update-screenshot-config', async (_event, config: Partial<ScreenshotConfig>) => {
    try {
      screenshotService?.updateConfig(config);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });
}

function setupHotkeyService() {
  hotkeyService = new HotkeyService();

  // Register default hotkeys
  if (screenshotService) {
    hotkeyService.registerHotkey('captureNow', 'CommandOrControl+Shift+C', async () => {
      try {
        if (!screenshotService) return;
        const results = await screenshotService.captureNow();
        if (mainWindow && results) {
          results.forEach(result => {
            mainWindow?.webContents.send('capture-frame', {
              imageData: result.buffer.toString('base64'),
              metadata: result.metadata,
            });
          });
        }
      } catch (error) {
        console.error('Hotkey capture failed:', error);
      }
    });

    hotkeyService.registerHotkey('toggleCapture', 'CommandOrControl+Shift+T', async () => {
      try {
        if (!screenshotService) return;
        if (screenshotService.isCapturing()) {
          await screenshotService.stop();
        } else {
          await screenshotService.start();
        }
      } catch (error) {
        console.error('Hotkey toggle failed:', error);
      }
    });
  }

  // IPC handlers for hotkey management
  ipcMain.handle('update-hotkey', async (_event, action: keyof HotkeyConfig, accelerator: string) => {
    try {
      hotkeyService?.updateHotkey(action, accelerator);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('get-hotkeys', () => {
    const hotkeys: Partial<HotkeyConfig> = {};
    ['captureNow', 'toggleCapture'].forEach(action => {
      const hotkey = hotkeyService?.getHotkey(action as keyof HotkeyConfig);
      if (hotkey) {
        hotkeys[action as keyof HotkeyConfig] = hotkey.accelerator;
      }
    });
    return hotkeys;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupScreenshotService();
  setupHotkeyService();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

  // Clean up hotkeys when app closes
  hotkeyService?.unregisterAll();
});

app.on('before-quit', () => {
  screenshotService?.stop();
  screenshotService = null;
});

ipcMain.handle('ping', () => 'pong');
