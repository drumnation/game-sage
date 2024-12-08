export type * from '../services/screenshot/types';
export type * from '../services/hotkey/types';
export type * from '../services/ai/types';

// Core types
export type ImageFormat = 'jpeg' | 'png' | 'webp';

// Re-export AI types for use in ElectronAPI
import type { AIAnalysisRequest, AIAnalysisResponse } from '../services/ai/types';
export { AIAnalysisRequest, AIAnalysisResponse };

export interface MessagePayload {
    message: string;
    timestamp: number;
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

export interface CaptureFrameMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: ImageFormat;
    isSceneChange?: boolean;
    previousSceneScore?: number;
    isHotkeyCapture?: boolean;
}

export interface CaptureFrame {
    buffer: Buffer;
    imageData: string;
    metadata: CaptureFrameMetadata;
}

export interface CaptureError {
    code?: string;
    message: string;
    error?: string;
}

export type CaptureResult = CaptureFrame | CaptureError;

export interface ScreenshotConfig {
    captureInterval: number;
    format: ImageFormat;
    quality: number;
    sceneChangeThreshold: number;
    maxConcurrentCaptures: number;
    detectSceneChanges?: boolean;
    activeDisplays?: string[];
}

export type PartialScreenshotConfig = Partial<ScreenshotConfig>;

export interface APIResponse<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export type ValidChannel = 'capture-frame' | 'game-event' | 'main-process-message' | 'shortcut-action' | 'capture-hotkey';

export interface GameEvent {
    type: string;
    data: unknown;
}

// Channel data type mapping
export type ChannelData<T extends ValidChannel> = T extends 'capture-frame' ? CaptureFrame | CaptureError :
    T extends 'game-event' ? GameEvent :
    T extends 'main-process-message' ? MessagePayload :
    T extends 'capture-hotkey' ? void :
    T extends 'shortcut-action' ? {
        action: string;
        success: boolean;
        error?: string;
        data?: unknown;
    } : never;

export interface ElectronAPI {
    // Event Listeners
    on<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    off<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    removeAllListeners(channel: ValidChannel): void;
    setMaxListeners(n: number): void;

    // Screenshot Management
    updateConfig(config: Partial<ScreenshotConfig>): Promise<APIResponse<void>>;
    getConfig(): Promise<APIResponse<ScreenshotConfig>>;
    captureNow(): Promise<APIResponse<CaptureResult[]>>;
    listDisplays(): Promise<APIResponse<DisplayInfo[]>>;
    startCapture(): Promise<APIResponse<void>>;
    stopCapture(): Promise<APIResponse<void>>;

    // Hotkey Management
    updateHotkey(action: string, accelerator: string): Promise<APIResponse<void>>;
    getHotkeys(): Promise<APIResponse<{ [key: string]: string }>>;

    // AI Analysis
    analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
} 