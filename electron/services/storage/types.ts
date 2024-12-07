import type { ScreenshotMetadata } from '../screenshot/types';

export interface StorageConfig {
    basePath: string;
    format: 'jpeg' | 'png' | 'webp';
    quality: number;
    maxStorageSize: number; // in bytes
    retentionDays: number;
    organizationStrategy: 'date' | 'game' | 'flat';
    namingPattern: string; // e.g., "{timestamp}_{game}_{scene}"
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
    name: string;
    scene?: string;
    tags?: string[];
}

export interface StorageStats {
    totalSize: number;
    fileCount: number;
    oldestFile: number;
    newestFile: number;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
    basePath: 'screenshots',
    format: 'jpeg',
    quality: 90,
    maxStorageSize: 1024 * 1024 * 1024, // 1GB
    retentionDays: 30,
    organizationStrategy: 'date',
    namingPattern: '{timestamp}_{scene}',
}; 