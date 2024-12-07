import type { ElectronAPI, ScreenshotConfig } from '../../../electron/types/electron-api';

const mockConfig: ScreenshotConfig = {
    captureInterval: 1000,
    width: 1920,
    height: 1080,
    format: 'jpeg'
};

export const mockElectronAPI: ElectronAPI = {
    on: jest.fn(),
    off: jest.fn(),
    updateConfig: jest.fn().mockResolvedValue(undefined),
    getConfig: jest.fn().mockResolvedValue(mockConfig)
}; 