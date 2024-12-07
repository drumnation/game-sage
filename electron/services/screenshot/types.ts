export interface ScreenshotConfig {
    captureInterval: number;
    format: 'jpeg' | 'png' | 'webp';
    quality: number;
    width?: number;
    height?: number;
    detectSceneChanges: boolean;
    sceneChangeThreshold: number;
    activeDisplays?: string[];
    maxConcurrentCaptures: number;
}

export interface ScreenshotMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: 'jpeg' | 'png' | 'webp';
    isSceneChange?: boolean;
    previousSceneScore?: number;
    isHotkeyCapture?: boolean;
}

export interface DisplayInfo {
    id: string;
    name: string;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    isPrimary: boolean;
}

export interface CaptureResult {
    buffer: Buffer;
    metadata: ScreenshotMetadata;
}

export const DEFAULT_CONFIG: ScreenshotConfig = {
    captureInterval: 1000,
    format: 'jpeg',
    quality: 80,
    detectSceneChanges: false,
    sceneChangeThreshold: 0.1,
    maxConcurrentCaptures: 1
}; 