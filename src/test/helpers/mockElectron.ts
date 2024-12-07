import type { ElectronAPI } from '../../../electron/types/electron-api';

export const mockElectronAPI: ElectronAPI = {
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    updateConfig: jest.fn().mockResolvedValue({ success: true }),
    getConfig: jest.fn().mockResolvedValue({ success: true, data: { captureInterval: 1000 } }),
    captureNow: jest.fn().mockResolvedValue({ success: true }),
    listDisplays: jest.fn().mockResolvedValue({ success: true, data: [] }),
    startCapture: jest.fn().mockResolvedValue({ success: true }),
    stopCapture: jest.fn().mockResolvedValue({ success: true }),
    updateHotkey: jest.fn().mockResolvedValue({ success: true }),
    getHotkeys: jest.fn().mockResolvedValue({ success: true, data: { captureNow: 'CommandOrControl+Shift+C' } }),
}; 