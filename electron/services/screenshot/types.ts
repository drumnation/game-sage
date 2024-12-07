export interface ScreenshotConfig {
    captureInterval: number; // Interval in milliseconds
    quality: number; // 1-100
    format: 'png' | 'jpeg' | 'webp';
    compression: number; // 1-9 for PNG, 1-100 for JPEG/WebP
    detectSceneChanges: boolean;
    sceneChangeThreshold: number; // 0-1, percentage of pixels that need to change
}

export interface ScreenshotMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: string;
    isSceneChange?: boolean;
    previousSceneScore?: number;
}

export interface CaptureResult {
    buffer: Buffer;
    metadata: ScreenshotMetadata;
}

export interface DisplayInfo {
    id: string;
    name: string;
    width: number;
    height: number;
    isPrimary: boolean;
}

export const DEFAULT_CONFIG: ScreenshotConfig = {
    captureInterval: 1000, // 1 second
    quality: 90,
    format: 'jpeg',
    compression: 9,
    detectSceneChanges: true,
    sceneChangeThreshold: 0.1, // 10% change threshold
}; 