import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { ScreenshotService } from './services/screenshot/ScreenshotService'
import { HotkeyService, setHotkeyModeState, getHotkeyModeState, setHotkeyService } from './services/hotkey/HotkeyService'
import type { ScreenshotConfig } from './services/screenshot/types'
import type { HotkeyConfig } from './services/hotkey/types'
import type { DisplayInfo, CaptureResult } from './services/screenshot/types'
import { AIService } from './services/ai/AIService'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set')
  app.quit()
}

interface APIResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

const DIST_PATH = join(__dirname, '../dist')

let mainWindow: BrowserWindow | null = null
let screenshotService: ScreenshotService | null = null
let hotkeyService: HotkeyService | null = null
let aiService: AIService | null = null

const WINDOW_WIDTH = 1200
const WINDOW_HEIGHT = 900

function createWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
    backgroundColor: '#141414',
  })

  // Set security-related HTTP headers
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "img-src 'self' data: blob:",
          "script-src 'self' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline'"
        ].join('; '),
        'X-Content-Type-Options': ['nosniff'],
        'X-Frame-Options': ['SAMEORIGIN'],
        'X-XSS-Protection': ['1; mode=block']
      }
    });
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(DIST_PATH, 'index.html'))
  }

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

async function setupScreenshotService() {
  screenshotService = new ScreenshotService();

  console.log('Initializing screenshot service...');
  await screenshotService.init();
  console.log('Screenshot service initialized');

  screenshotService.on('error', (error: Error) => {
    if (mainWindow) {
      mainWindow.webContents.send('main-process-message', {
        message: `Screenshot error: ${error.message}`,
        timestamp: Date.now(),
      });
    }
  });

  // Forward capture frame events to renderer
  screenshotService.on('capture-frame', (data) => {
    if (mainWindow) {
      console.log('[Frame Event] Forwarding frame to renderer');
      mainWindow.webContents.send('capture-frame', data);
    }
  });

  ipcMain.handle('start-capture', async () => {
    try {
      await screenshotService?.start();
      return { success: true } as APIResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage } as APIResponse;
    }
  });

  ipcMain.handle('stop-capture', async () => {
    try {
      await screenshotService?.stop();
      return { success: true } as APIResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage } as APIResponse;
    }
  });

  ipcMain.handle('capture-now', async () => {
    try {
      const results = await screenshotService?.captureNow();
      if (!results || results.length === 0) {
        return { success: false, error: 'No frames captured' } as APIResponse;
      }

      // Send all frames to renderer, but only mark the first one as hotkey capture
      results.forEach((result, index) => {
        if (!('buffer' in result && 'metadata' in result)) {
          return;
        }

        // Only mark the first frame as a hotkey capture
        if (index === 0) {
          result.metadata.isHotkeyCapture = true;
        }

        // Send frame event
        sendFrameToRenderer(result);
      });

      return { success: true } as APIResponse;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as APIResponse;
    }
  });

  ipcMain.handle('update-screenshot-config', async (_event, config: Partial<ScreenshotConfig>) => {
    try {
      await screenshotService?.updateConfig(config);
      return { success: true } as APIResponse;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage } as APIResponse;
    }
  });

  ipcMain.handle('get-screenshot-config', async () => {
    try {
      console.log('IPC: Handling get-screenshot-config request');
      const config = await screenshotService?.getConfig();
      console.log('IPC: Retrieved config:', config);
      return { success: true, data: config } as APIResponse<ScreenshotConfig>;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('IPC: Error getting screenshot config:', errorMessage);
      return { success: false, error: errorMessage } as APIResponse;
    }
  });

  ipcMain.handle('list-displays', async () => {
    try {
      console.log('IPC: Handling list-displays request');
      const displays = await screenshotService?.getDisplays();
      console.log('IPC: Retrieved displays:', displays);
      return { success: true, data: displays || [] } as APIResponse<DisplayInfo[]>;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('IPC: Error listing displays:', errorMessage);
      return { success: false, error: errorMessage } as APIResponse;
    }
  });
}

function setupHotkeyService() {
  hotkeyService = new HotkeyService();
  setHotkeyService(hotkeyService);

  // Register default hotkeys with debouncing
  if (screenshotService) {
    let lastCaptureTime = 0;
    const DEBOUNCE_MS = 500; // Prevent captures within 500ms of each other

    hotkeyService.registerHotkey('captureNow', 'CommandOrControl+Shift+C', async () => {
      try {
        if (!screenshotService || !getHotkeyModeState()) return;

        const now = Date.now();
        if (now - lastCaptureTime < DEBOUNCE_MS) {
          console.log('Debouncing capture, too soon after last capture');
          return;
        }
        lastCaptureTime = now;

        // Only notify UI that hotkey was pressed if hotkey mode is enabled
        mainWindow?.webContents.send('capture-hotkey');
      } catch (error) {
        console.error('Hotkey capture failed:', error);
      }
    });

    hotkeyService.registerHotkey('toggleCapture', 'CommandOrControl+Shift+T', async () => {
      try {
        if (!screenshotService || !getHotkeyModeState()) return;

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
  ipcMain.handle('set-hotkey-mode', (_event, enabled: boolean) => {
    setHotkeyModeState(enabled);
    return { success: true };
  });

  ipcMain.handle('get-hotkey-mode', () => {
    return { success: true, data: getHotkeyModeState() };
  });

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
    return { success: true, data: hotkeys };
  });
}

function createServices() {
  aiService = new AIService();

  return {
    aiService,
  };
}

app.whenReady().then(async () => {
  createWindow();
  await setupScreenshotService();
  setupHotkeyService();
  createServices();

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

// Function to handle sending frame to renderer
function sendFrameToRenderer(result: CaptureResult) {
  if (mainWindow && 'buffer' in result && 'metadata' in result) {
    console.log('[Frame Event] Sending frame to renderer');
    mainWindow.webContents.send('capture-frame', {
      imageData: result.buffer.toString('base64'),
      metadata: result.metadata,
    });
  }
}
