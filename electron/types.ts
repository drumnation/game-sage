import type { ScreenshotMetadata } from './services/screenshot/types';
import type { ShortcutConfig } from './services/shortcuts/types';

export type ValidChannel = 'capture-frame' | 'game-event' | 'main-process-message' | 'shortcut-action';

export interface GameEvent {
    type: string;
    data: unknown;
}

export interface ScreenshotConfig {
    captureInterval: number;
    format: string;
    quality: number;
    detectSceneChanges: boolean;
    sceneChangeThreshold: number;
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
}

export interface CaptureResult {
    buffer: Buffer;
    metadata: {
        timestamp: number;
        format: string;
        size: number;
        dimensions: {
            width: number;
            height: number;
        };
    };
}

export interface CaptureFrame {
    buffer: Buffer;
    metadata: {
        timestamp: number;
        displayId: string;
        width: number;
        height: number;
        format: string;
        isSceneChange?: boolean;
    };
}

export interface CaptureError {
    error: string;
}

export interface ElectronAPI {
    on(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    off(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    updateConfig(config: Partial<ScreenshotConfig>): Promise<void>;
    getConfig(): Promise<ScreenshotConfig>;
    captureNow(): Promise<CaptureResult[]>;
}

export interface MessagePayload {
    message: string;
    timestamp: number;
}

export interface ShortcutActionPayload {
    action: keyof ShortcutConfig;
    success: boolean;
    error?: string;
    data?: unknown;
}

export interface APIResponse<T = void> {
    success: boolean;
    error?: string;
    data?: T;
}

export interface CaptureFrameResponse {
    frames: Array<{
        imageData: string;
        metadata: ScreenshotMetadata;
    }>;
}

export type ChannelCallback<T> = (data: T) => void;