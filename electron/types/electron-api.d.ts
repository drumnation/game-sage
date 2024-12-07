import type { GameEvent, MessagePayload } from '../types';

type ChannelTypeMap = {
    'capture-frame': CaptureFrame;
    'game-event': GameEvent;
    'main-process-message': MessagePayload;
};

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
    windowId?: number;
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

export interface ElectronAPI {
    on(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    off(channel: string, callback: (data: CaptureFrame | CaptureError) => void): void;
    updateConfig(config: PartialScreenshotConfig): Promise<void>;
    getConfig(): Promise<ScreenshotConfig>;
    captureNow(): Promise<CaptureResult[]>;
    listDisplays(): Promise<DisplayInfo[]>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
} 