import type {
    ScreenshotConfig as ElectronScreenshotConfig,
    CaptureResult,
    DisplayInfo,
    CaptureFrame,
    CaptureFrameMetadata,
    ImageFormat
} from '../../types';

export type { CaptureResult, DisplayInfo, CaptureFrame, CaptureFrameMetadata };
export type ScreenshotConfig = ElectronScreenshotConfig;
export type StorageFormat = ImageFormat;

export type OrganizationStrategy = 'flat' | 'date' | 'custom';

export interface StorageConfig {
    basePath: string;
    format: StorageFormat;
    quality: number;
    maxStorageSize: number;  // in bytes
    retentionDays: number;
    organizationStrategy: OrganizationStrategy;
    namingPattern: string;
}

export interface StorageService {
    init(): Promise<void>;
    loadConfig<T>(key: string): Promise<T | null>;
    saveConfig<T>(key: string, data: T): Promise<void>;
    saveScreenshot(screenshot: CaptureFrame): Promise<StoredScreenshot>;
    deleteScreenshot(id: string): Promise<void>;
    updateConfig(config: Partial<StorageConfig>): Promise<void>;
    getStats(): Promise<StorageStats>;
}

export interface StoredScreenshot {
    id: string;
    path: string;
    metadata: CaptureFrameMetadata;
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
    oldestScreenshot: number;
    newestScreenshot: number;
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