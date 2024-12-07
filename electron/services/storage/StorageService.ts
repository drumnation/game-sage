import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { EventEmitter } from 'events';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type { StorageConfig, StoredScreenshot, StorageStats, GameContext } from './types';
import type { CaptureResult } from '../screenshot/types';
import { DEFAULT_STORAGE_CONFIG } from './types';

export class StorageService extends EventEmitter {
    private config: StorageConfig;
    private metadata: Map<string, StoredScreenshot> = new Map();
    private initialized = false;

    constructor(config: Partial<StorageConfig> = {}) {
        super();
        this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    }

    public async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Ensure base directory exists
            const baseDir = this.getBasePath();
            await fs.mkdir(baseDir, { recursive: true });

            // Load metadata from disk
            await this.loadMetadata();

            // Clean up old files
            await this.cleanup();

            this.initialized = true;
        } catch (error) {
            this.emit('error', {
                action: 'initialize',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    public async saveScreenshot(
        screenshot: CaptureResult,
        gameContext?: GameContext
    ): Promise<StoredScreenshot> {
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

            // Create metadata
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

    public async getScreenshot(id: string): Promise<StoredScreenshot | null> {
        return this.metadata.get(id) || null;
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

    public async getStats(): Promise<StorageStats> {
        const screenshots = Array.from(this.metadata.values());
        const totalSize = screenshots.reduce((sum, s) => sum + s.size, 0);
        const timestamps = screenshots.map(s => s.createdAt);

        return {
            totalSize,
            fileCount: screenshots.length,
            oldestFile: Math.min(...timestamps),
            newestFile: Math.max(...timestamps),
        };
    }

    public async updateConfig(config: Partial<StorageConfig>): Promise<void> {
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...config };

        // If base path changed, move files
        if (oldConfig.basePath !== this.config.basePath) {
            await this.migrateFiles(oldConfig.basePath, this.config.basePath);
        }

        await this.saveMetadata();
    }

    private async processAndSaveImage(buffer: Buffer, filePath: string): Promise<void> {
        const sharpInstance = sharp(buffer);

        switch (this.config.format) {
            case 'png':
                await sharpInstance
                    .png({ quality: this.config.quality })
                    .toFile(filePath);
                break;
            case 'webp':
                await sharpInstance
                    .webp({ quality: this.config.quality })
                    .toFile(filePath);
                break;
            case 'jpeg':
            default:
                await sharpInstance
                    .jpeg({ quality: this.config.quality })
                    .toFile(filePath);
        }
    }

    private async enforceStorageLimits(): Promise<void> {
        const stats = await this.getStats();

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

    private async cleanup(): Promise<void> {
        const now = Date.now();
        const maxAge = this.config.retentionDays * 24 * 60 * 60 * 1000;

        for (const [id, screenshot] of this.metadata.entries()) {
            if (now - screenshot.createdAt > maxAge) {
                await this.deleteScreenshot(id);
            }
        }
    }

    private getBasePath(): string {
        return path.join(app.getPath('userData'), this.config.basePath);
    }

    private getFilePath(fileName: string): string {
        const baseDir = this.getBasePath();
        const date = new Date();
        let relativePath: string;

        switch (this.config.organizationStrategy) {
            case 'date':
                relativePath = path.join(
                    date.getFullYear().toString(),
                    (date.getMonth() + 1).toString().padStart(2, '0'),
                    date.getDate().toString().padStart(2, '0')
                );
                break;
            case 'game':
                relativePath = '';
                break;
            case 'flat':
            default:
                relativePath = '';
        }

        return path.join(baseDir, relativePath, `${fileName}.${this.config.format}`);
    }

    private generateFileName(timestamp: number, gameContext?: GameContext): string {
        let name = this.config.namingPattern;
        const date = new Date(timestamp);

        // Replace placeholders
        name = name.replace('{timestamp}', date.toISOString().replace(/[:.]/g, '-'));
        name = name.replace('{game}', gameContext?.name || 'unknown');
        name = name.replace('{scene}', gameContext?.scene || 'unknown');

        return name;
    }

    private async loadMetadata(): Promise<void> {
        try {
            const metadataPath = path.join(this.getBasePath(), 'metadata.json');
            const data = await fs.readFile(metadataPath, 'utf-8');
            const parsed = JSON.parse(data);

            this.metadata.clear();
            for (const [id, screenshot] of Object.entries(parsed)) {
                this.metadata.set(id, screenshot as StoredScreenshot);
            }
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private async saveMetadata(): Promise<void> {
        const metadataPath = path.join(this.getBasePath(), 'metadata.json');
        const data = Object.fromEntries(this.metadata.entries());
        await fs.writeFile(metadataPath, JSON.stringify(data, null, 2));
    }

    private async migrateFiles(oldBasePath: string, newBasePath: string): Promise<void> {
        const oldPath = path.join(app.getPath('userData'), oldBasePath);
        const newPath = path.join(app.getPath('userData'), newBasePath);

        // Create new directory
        await fs.mkdir(newPath, { recursive: true });

        // Move all files
        for (const [id, screenshot] of this.metadata.entries()) {
            const oldFilePath = screenshot.path;
            const fileName = path.basename(oldFilePath);
            const newFilePath = path.join(newPath, fileName);

            try {
                await fs.rename(oldFilePath, newFilePath);
                this.metadata.set(id, {
                    ...screenshot,
                    path: newFilePath,
                });
            } catch (error) {
                console.error(`Failed to move file ${oldFilePath}:`, error);
            }
        }

        await this.saveMetadata();

        // Try to remove old directory if empty
        try {
            await fs.rmdir(oldPath);
        } catch {
            // Ignore errors if directory is not empty
        }
    }
} 