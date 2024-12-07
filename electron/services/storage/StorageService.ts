import { StorageConfig, StorageService as IStorageService, StoredScreenshot, StorageStats } from './types';
import type { CaptureFrame } from '../../types/electron-api';
import fs from 'fs/promises';
import path from 'path';

export class StorageService implements IStorageService {
    private config: StorageConfig;
    private configPath: string;

    constructor(config: StorageConfig) {
        this.config = config;
        this.configPath = path.join(this.config.basePath, 'config');
    }

    public async init(): Promise<void> {
        try {
            await fs.mkdir(this.config.basePath, { recursive: true });
            await fs.mkdir(this.configPath, { recursive: true });
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    public async loadConfig<T>(key: string): Promise<T | null> {
        try {
            const data = await fs.readFile(path.join(this.configPath, `${key}.json`), 'utf-8');
            return JSON.parse(data) as T;
        } catch (error) {
            if ((error as { code: string }).code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    public async saveConfig<T>(key: string, data: T): Promise<void> {
        await fs.writeFile(
            path.join(this.configPath, `${key}.json`),
            JSON.stringify(data, null, 2)
        );
    }

    public async saveScreenshot(screenshot: CaptureFrame): Promise<StoredScreenshot> {
        const id = crypto.randomUUID();
        const fileName = `screenshot-${new Date(screenshot.metadata.timestamp).toISOString().replace(/:/g, '-')}.png`;
        const filePath = path.join(this.config.basePath, fileName);

        await fs.writeFile(filePath, screenshot.buffer);
        const stats = await fs.stat(filePath);

        const storedScreenshot: StoredScreenshot = {
            id,
            path: filePath,
            metadata: screenshot.metadata,
            size: stats.size,
            createdAt: Date.now()
        };

        return storedScreenshot;
    }

    public async deleteScreenshot(id: string): Promise<void> {
        const metadata = await this.loadConfig<Record<string, StoredScreenshot>>('metadata');
        if (!metadata || !metadata[id]) {
            throw new Error(`Screenshot ${id} not found`);
        }

        await fs.unlink(metadata[id].path);
        delete metadata[id];
        await this.saveConfig('metadata', metadata);
    }

    public async updateConfig(config: Partial<StorageConfig>): Promise<void> {
        const oldPath = this.config.basePath;
        this.config = { ...this.config, ...config };

        if (config.basePath && config.basePath !== oldPath) {
            await fs.mkdir(config.basePath, { recursive: true });
            // Migration logic would go here
        }
    }

    public async getStats(): Promise<StorageStats> {
        try {
            const metadata = await this.loadConfig<Record<string, StoredScreenshot>>('metadata') || {};
            const screenshots = Object.values(metadata);

            const totalSize = screenshots.reduce((sum, screenshot) => sum + screenshot.size, 0);
            const availableSize = this.config.maxStorageSize - totalSize;

            return {
                count: screenshots.length,
                totalSize,
                availableSize: Math.max(0, availableSize)
            };
        } catch (error) {
            console.error('Failed to get storage stats:', error);
            return {
                count: 0,
                totalSize: 0,
                availableSize: this.config.maxStorageSize
            };
        }
    }
} 