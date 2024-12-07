import type { ElectronAPI, ScreenshotConfig, DisplayInfo, CaptureResult } from '@electron/types';

const defaultConfig: ScreenshotConfig = {
    captureInterval: 1000,
    format: 'jpeg',
    quality: 80,
    sceneChangeThreshold: 0.1,
    maxConcurrentCaptures: 1,
    detectSceneChanges: false,
    activeDisplays: ['1']
};

export const mockElectronAPI: ElectronAPI = {
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    updateConfig: jest.fn().mockResolvedValue({ success: true }),
    getConfig: jest.fn().mockResolvedValue({ success: true, data: defaultConfig }),
    captureNow: jest.fn().mockResolvedValue({ success: true, data: [] as CaptureResult[] }),
    listDisplays: jest.fn().mockResolvedValue({ success: true, data: [] as DisplayInfo[] }),
    startCapture: jest.fn().mockResolvedValue({ success: true }),
    stopCapture: jest.fn().mockResolvedValue({ success: true }),
    updateHotkey: jest.fn().mockResolvedValue({ success: true }),
    getHotkeys: jest.fn().mockResolvedValue({ success: true, data: { captureNow: 'CommandOrControl+Shift+C' } })
}; 