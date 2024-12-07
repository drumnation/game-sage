import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { CaptureResult } from '../screenshot/types';
import type { GameContext, StorageConfig, StorageStats, StoredScreenshot } from './types';
import { DEFAULT_STORAGE_CONFIG } from './types';

export class StorageService extends EventEmitter {
    private config: StorageConfig;
    private metadata: Map<string, StoredScreenshot>;
    private initialized: boolean;

    constructor(config?: Partial<StorageConfig>) {
        super();
        this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
        this.metadata = new Map();
        this.initialized = false;
    }

    public async init(): Promise<void> {
        if (this.initialized) return;

        try {
            await fs.mkdir(this.config.basePath, { recursive: true });
            await this.loadMetadata();
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public async saveScreenshot(
        screenshot: CaptureResult,
        gameContext?: GameContext
    ): Promise<StoredScreenshot> {
        if (!('buffer' in screenshot) || !('metadata' in screenshot)) {
            throw new Error('Invalid screenshot data');
        }

        if (!this.initialized) {
            throw new Error('Storage service not initialized');
        }

        try {
            const id = uuidv4();
            const timestamp = Date.now();
            const fileName = this.generateFileName(timestamp, gameContext);
            const filePath = this.getFilePath(fileName);

            // Process and save the image
            await this.processAndSaveImage(screenshot.buffer, filePath);

            // Get file size
            const stats = await fs.stat(filePath);

            const storedScreenshot: StoredScreenshot = {
                id,
                path: filePath,
                metadata: screenshot.metadata,
                size: stats.size,
                createdAt: timestamp,
                gameContext,
            };

            // Save metadata
            this.metadata.set(id, storedScreenshot);
            await this.saveMetadata();

            // Check storage limits
            await this.enforceStorageLimits();

            this.emit('screenshot-saved', storedScreenshot);
            return storedScreenshot;
        } catch (error) {
            this.emit('error', {
                action: 'saveScreenshot',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    private generateFileName(timestamp: number, gameContext?: GameContext): string {
        const date = new Date(timestamp);
        const dateStr = date.toISOString().replace(/[:.]/g, '-');
        const contextStr = gameContext ? `-${gameContext.gameId}-${gameContext.eventType}` : '';
        return `screenshot-${dateStr}${contextStr}.png`;
    }

    private getFilePath(fileName: string): string {
        return path.join(this.config.basePath, fileName);
    }

    private async processAndSaveImage(buffer: Buffer, filePath: string): Promise<void> {
        await sharp(buffer)
            .png({ quality: 90 })
            .toFile(filePath);
    }

    private async loadMetadata(): Promise<void> {
        try {
            const metadataPath = path.join(this.config.basePath, 'metadata.json');
            const data = await fs.readFile(metadataPath, 'utf-8');
            const parsed = JSON.parse(data);
            this.metadata = new Map(Object.entries(parsed));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private async saveMetadata(): Promise<void> {
        const metadataPath = path.join(this.config.basePath, 'metadata.json');
        const data = Object.fromEntries(this.metadata);
        await fs.writeFile(metadataPath, JSON.stringify(data, null, 2));
    }

    private async enforceStorageLimits(): Promise<void> {
        const stats = await this.getStorageStats();
        if (stats.totalSize > this.config.maxStorageSize) {
            const screenshots = Array.from(this.metadata.values())
                .sort((a, b) => a.createdAt - b.createdAt);

            while (stats.totalSize > this.config.maxStorageSize && screenshots.length > 0) {
                const oldest = screenshots.shift();
                if (oldest) {
                    await this.deleteScreenshot(oldest.id);
                }
            }
        }
    }

    public async deleteScreenshot(id: string): Promise<void> {
        const screenshot = this.metadata.get(id);
        if (!screenshot) return;

        try {
            await fs.unlink(screenshot.path);
            this.metadata.delete(id);
            await this.saveMetadata();
            this.emit('screenshot-deleted', id);
        } catch (error) {
            this.emit('error', {
                action: 'deleteScreenshot',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    public async getStorageStats(): Promise<StorageStats> {
        const screenshots = Array.from(this.metadata.values());
        const totalSize = screenshots.reduce((sum, s) => sum + s.size, 0);
        return {
            count: screenshots.length,
            totalSize,
            availableSize: this.config.maxStorageSize - totalSize,
        };
    }

    public async updateConfig(newConfig: Partial<StorageConfig>): Promise<void> {
        const oldPath = this.config.basePath;
        this.config = { ...this.config, ...newConfig };

        if (newConfig.basePath && newConfig.basePath !== oldPath) {
            await fs.mkdir(newConfig.basePath, { recursive: true });
            for (const screenshot of this.metadata.values()) {
                const newPath = path.join(
                    newConfig.basePath,
                    path.basename(screenshot.path)
                );
                await fs.rename(screenshot.path, newPath);
                screenshot.path = newPath;
            }
            await this.saveMetadata();
        }
    }
} 