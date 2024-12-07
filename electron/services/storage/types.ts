import type {
    ScreenshotConfig as ElectronScreenshotConfig,
    CaptureResult,
    DisplayInfo,
    CaptureFrameMetadata as ScreenshotMetadata
} from '../../types/electron-api';

export type { CaptureResult, DisplayInfo, ScreenshotMetadata };
export type ScreenshotConfig = ElectronScreenshotConfig;

export interface StorageConfig {
    basePath: string;
    format: 'jpeg' | 'png' | 'webp';
    quality: number;
    maxStorageSize: number; // in bytes
    retentionDays: number;
    organizationStrategy: 'date' | 'game' | 'flat';
    namingPattern: string;
}

export interface StoredScreenshot {
    id: string;
    path: string;
    metadata: ScreenshotMetadata;
    size: number;
    createdAt: number;
    gameContext?: GameContext;
}

export interface GameContext {
    gameId: string;
    eventType: string;
    name?: string;
    scene?: string;
}

export interface StorageStats {
    count: number;
    totalSize: number;
    availableSize: number;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
    basePath: 'screenshots',
    format: 'jpeg',
    quality: 90,
    maxStorageSize: 1024 * 1024 * 1024, // 1GB
    retentionDays: 30,
    organizationStrategy: 'date',
    namingPattern: '{timestamp}_{scene}'
}; 