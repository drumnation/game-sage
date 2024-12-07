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

export interface CaptureFrameMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: 'jpeg' | 'png' | 'webp';
    isSceneChange?: boolean;
    previousSceneScore?: number;
}

export interface CaptureFrame {
    buffer: Buffer;
    metadata: CaptureFrameMetadata;
}

export interface CaptureError {
    code: string;
    message: string;
}

export interface ScreenshotConfig {
    captureInterval: number;
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    detectSceneChanges?: boolean;
    sceneChangeThreshold?: number;
    compression?: number;
    activeDisplays?: string[];
}

export type PartialScreenshotConfig = Partial<ScreenshotConfig>;

export type CaptureResult = CaptureFrame | CaptureError;

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ElectronAPI {
    on(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    off(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    removeAllListeners(channel: string): void;
    setMaxListeners(n: number): void;
    updateConfig(config: PartialScreenshotConfig): Promise<APIResponse<void>>;
    getConfig(): Promise<APIResponse<ScreenshotConfig>>;
    captureNow(): Promise<APIResponse<CaptureResult[]>>;
    listDisplays(): Promise<APIResponse<DisplayInfo[]>>;
    startCapture(): Promise<APIResponse<void>>;
    stopCapture(): Promise<APIResponse<void>>;
    updateHotkey(action: string, accelerator: string): Promise<APIResponse<void>>;
    getHotkeys(): Promise<APIResponse<{ [key: string]: string }>>;
} 