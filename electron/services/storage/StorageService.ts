import { StorageConfig, StorageService as IStorageService, StoredScreenshot, StorageStats } from './types';
import type { CaptureFrame } from '../../types/electron-api';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'node:crypto';

export class StorageService implements IStorageService {
    private config: StorageConfig;
    private configPath: string;
    private metadata: Record<string, StoredScreenshot>;

    constructor(config: StorageConfig) {
        this.config = config;
        this.configPath = path.join(this.config.basePath, 'config');
        this.metadata = {};
    }

    public async init(): Promise<void> {
        try {
            await fs.mkdir(this.config.basePath, { recursive: true });
            await fs.mkdir(this.configPath, { recursive: true });
            const savedMetadata = await this.loadConfig<Record<string, StoredScreenshot>>('metadata');
            if (savedMetadata) {
                this.metadata = savedMetadata;
            }
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

    private async enforceStorageLimits(): Promise<void> {
        let totalSize = 0;
        const screenshots = Object.values(this.metadata).sort((a, b) => a.createdAt - b.createdAt);

        for (const screenshot of screenshots) {
            totalSize += screenshot.size;
        }

        while (totalSize > this.config.maxStorageSize && screenshots.length > 0) {
            const oldestScreenshot = screenshots.shift();
            if (oldestScreenshot) {
                await this.deleteScreenshot(oldestScreenshot.id);
                totalSize -= oldestScreenshot.size;
            }
        }
    }

    public async saveScreenshot(screenshot: CaptureFrame): Promise<StoredScreenshot> {
        const id = randomUUID();
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

        this.metadata[id] = storedScreenshot;
        await this.saveConfig('metadata', this.metadata);
        await this.enforceStorageLimits();

        return storedScreenshot;
    }

    public async deleteScreenshot(id: string): Promise<void> {
        if (!this.metadata[id]) {
            throw new Error(`Screenshot ${id} not found`);
        }

        const screenshot = this.metadata[id];
        await fs.unlink(screenshot.path);
        delete this.metadata[id];
        await this.saveConfig('metadata', this.metadata);
    }

    public async updateConfig(config: Partial<StorageConfig>): Promise<void> {
        const oldPath = this.config.basePath;
        this.config = { ...this.config, ...config };

        if (config.basePath && config.basePath !== oldPath) {
            await fs.mkdir(config.basePath, { recursive: true });
            await fs.mkdir(path.join(config.basePath, 'config'), { recursive: true });
            // Migration logic would go here
        }
    }

    public async getStats(): Promise<StorageStats> {
        const screenshots = Object.values(this.metadata);
        const totalSize = screenshots.reduce((acc, shot) => acc + shot.size, 0);
        const availableSize = Math.max(0, this.config.maxStorageSize - totalSize);

        return {
            count: screenshots.length,
            totalSize,
            availableSize,
            oldestScreenshot: screenshots.length > 0 ? Math.min(...screenshots.map(s => s.createdAt)) : 0,
            newestScreenshot: screenshots.length > 0 ? Math.max(...screenshots.map(s => s.createdAt)) : 0
        };
    }
} 