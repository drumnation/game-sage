import type {
    ScreenshotConfig as ElectronScreenshotConfig,
    CaptureResult,
    DisplayInfo,
    CaptureFrameMetadata as ScreenshotMetadata
} from '../../types/electron-api';

export type { CaptureResult, DisplayInfo, ScreenshotMetadata };
export type ScreenshotConfig = ElectronScreenshotConfig;

export const DEFAULT_CONFIG: ScreenshotConfig = {
    captureInterval: 1000,
    format: 'jpeg',
    quality: 80,
    detectSceneChanges: false,
    sceneChangeThreshold: 0.1,
    compression: 6
}; 