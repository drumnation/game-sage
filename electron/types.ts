import type { ScreenshotMetadata } from './services/screenshot/types';
import type { ShortcutConfig } from './services/shortcuts/types';

export type ValidChannel = 'capture-frame' | 'game-event' | 'main-process-message' | 'shortcut-action';

export interface GameEvent {
    type: string;
    data: unknown;
}

export interface CaptureFrame {
    imageData: string;
    metadata: ScreenshotMetadata;
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