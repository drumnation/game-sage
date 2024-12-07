import type { ElectronAPI } from '../../../electron/types/electron-api';

export const mockElectronAPI: ElectronAPI = {
    on: jest.fn(),
    off: jest.fn(),
    updateConfig: jest.fn().mockResolvedValue(undefined),
    getConfig: jest.fn().mockResolvedValue({ captureInterval: 1000 }),
    captureNow: jest.fn().mockResolvedValue(undefined),
    listDisplays: jest.fn().mockResolvedValue([]),
    startCapture: jest.fn().mockResolvedValue(undefined),
    stopCapture: jest.fn().mockResolvedValue(undefined)
}; 