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
          "default-src 'self';",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
          "font-src 'self' https://fonts.gstatic.com;",
          "img-src 'self' data: blob:;",
          "connect-src 'self';"
        ].join(' ')
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

function setupIpcHandlers() {
  console.log('[Main] Setting up IPC handlers...');

  // Screenshot IPC handlers
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
      console.log('[Main] Handling capture-now request');
      const results = await screenshotService?.captureNow();
      if (!results || results.length === 0) {
        console.log('[Main] No frames captured');
        return { success: false, error: 'No frames captured' } as APIResponse;
      }

      // Return success without sending frames - ScreenshotService already emits them
      console.log(`[Main] Capture successful, captured ${results.length} frames`);
      return { success: true } as APIResponse;
    } catch (error) {
      console.error('[Main] Capture failed:', error);
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

  // Hotkey IPC handlers
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
    try {
      const hotkeys: Partial<HotkeyConfig> = {};
      ['captureNow', 'toggleCapture'].forEach(action => {
        const hotkey = hotkeyService?.getHotkey(action as keyof HotkeyConfig);
        if (hotkey) {
          hotkeys[action as keyof HotkeyConfig] = hotkey.accelerator;
        }
      });
      return { success: true, data: hotkeys };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('set-hotkey-mode', (_event, enabled: boolean) => {
    try {
      setHotkeyModeState(enabled);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('get-hotkey-mode', () => {
    try {
      return { success: true, data: getHotkeyModeState() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  });

  console.log('[Main] IPC handlers setup complete');
}

async function createServices() {
  try {
    console.log('[Main] Starting services initialization...');

    // Initialize AI service first
    console.log('[Main] Initializing AI service...');
    aiService = new AIService();
    console.log('[Main] AI service initialized successfully');

    // Initialize screenshot service
    console.log('[Main] Initializing screenshot service...');
    screenshotService = new ScreenshotService();
    await screenshotService.init();
    console.log('[Main] Screenshot service initialized successfully');

    // Set up screenshot service event handlers
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

    // Initialize hotkey service
    console.log('[Main] Initializing hotkey service...');
    hotkeyService = new HotkeyService();
    setHotkeyService(hotkeyService);

    // Set up hotkey handlers
    if (screenshotService) {
      let lastCaptureTime = 0;
      const DEBOUNCE_MS = 500;
      let isCapturing = false;

      hotkeyService.registerHotkey('captureNow', 'CommandOrControl+Shift+C', async () => {
        try {
          if (!screenshotService || !getHotkeyModeState()) return;

          const now = Date.now();
          if (now - lastCaptureTime < DEBOUNCE_MS || isCapturing) {
            console.log('Debouncing hotkey, too soon or capture in progress');
            return;
          }

          isCapturing = true;
          lastCaptureTime = now;

          const results = await screenshotService.captureNow();
          if (Array.isArray(results)) {
            results.forEach(result => {
              if ('metadata' in result) {
                result.metadata.isHotkeyCapture = true;
                result.metadata.timestamp = now;
              }
              sendFrameToRenderer(result);
            });
          }
        } catch (error) {
          console.error('Hotkey capture failed:', error);
        } finally {
          isCapturing = false;
        }
      });
    }

    console.log('[Main] Hotkey service initialized successfully');

    // Set up all IPC handlers after services are initialized
    setupIpcHandlers();

    console.log('[Main] All services initialized successfully');
    return { aiService, screenshotService, hotkeyService };
  } catch (error) {
    console.error('[Main] Error initializing services:', error);
    throw error;
  }
}

app.whenReady().then(async () => {
  try {
    console.log('[Main] App ready, starting initialization...');
    createWindow();
    const services = await createServices();
    console.log('[Main] Services initialized:', Object.keys(services));

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('[Main] Failed to initialize application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  console.log('[Main] All windows closed, cleaning up...');
  if (process.platform !== 'darwin') {
    app.quit();
  }

  // Clean up services
  try {
    hotkeyService?.unregisterAll();
    screenshotService?.stop();
    aiService = null;
    screenshotService = null;
    hotkeyService = null;
    console.log('[Main] Services cleaned up successfully');
  } catch (error) {
    console.error('[Main] Error cleaning up services:', error);
  }
});

app.on('before-quit', () => {
  screenshotService?.stop();
  screenshotService = null;
});

ipcMain.handle('ping', () => 'pong');

// Function to handle sending frame to renderer
function sendFrameToRenderer(result: CaptureResult) {
  if (mainWindow && 'buffer' in result && 'metadata' in result) {
    // Add timestamp if not present
    const metadata = {
      ...result.metadata,
      timestamp: result.metadata.timestamp || Date.now()
    };

    console.log('[Frame Event] Sending frame to renderer');
    mainWindow.webContents.send('capture-frame', {
      imageData: result.buffer.toString('base64'),
      metadata,
    });
  }
}
