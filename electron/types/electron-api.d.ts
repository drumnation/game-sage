import type { GameEvent, MessagePayload } from '../types';

type ChannelTypeMap = {
    'capture-frame': CaptureFrame;
    'game-event': GameEvent;
    'main-process-message': MessagePayload;
};

export interface CaptureFrameMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: string;
    isSceneChange?: boolean;
}

export interface CaptureFrame {
    buffer: Buffer;
    metadata: CaptureFrameMetadata;
}

export interface CaptureError {
    error: string;
}

export interface ScreenshotConfig {
    captureInterval: number;
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
    detectSceneChanges?: boolean;
    sceneChangeThreshold?: number;
}

export type PartialScreenshotConfig = Partial<ScreenshotConfig>;

export interface ElectronAPI {
    on(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    off(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    updateConfig(config: PartialScreenshotConfig): Promise<void>;
    getConfig(): Promise<ScreenshotConfig>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
} 