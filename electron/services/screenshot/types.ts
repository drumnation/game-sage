import { GameMode } from '../../services/ai/types';

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
    narrationMode?: boolean;
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

export interface AIAnalysisResponse {
    content: string;
    role: 'assistant' | 'user' | 'system';
}

export interface AIResponseWithSummary extends AIAnalysisResponse {
    summary: string;
}

export interface AIMemoryEntry {
    timestamp: number;
    summary: string;
    mode: GameMode;
}

export interface CaptureResult {
    buffer: Buffer;
    imageData: string;
    metadata: ScreenshotMetadata;
    aiResponse?: AIResponseWithSummary;
    aiMemory?: AIMemoryEntry[];
}

export const DEFAULT_CONFIG: ScreenshotConfig = {
    captureInterval: 10000,
    format: 'jpeg',
    quality: 80,
    detectSceneChanges: false,
    sceneChangeThreshold: 0.1,
    maxConcurrentCaptures: 1,
    narrationMode: false
}; 