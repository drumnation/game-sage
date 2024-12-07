import { screen } from 'electron';
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { EventEmitter } from 'events';
import {
    ScreenshotConfig,
    ScreenshotMetadata,
    CaptureResult,
    DisplayInfo,
    DEFAULT_CONFIG,
} from './types';
import { StorageConfig, StorageFormat } from '../storage/types';
import { StorageService } from '../storage/StorageService';

export class ScreenshotService extends EventEmitter {
    private config: ScreenshotConfig;
    private captureInterval: NodeJS.Timeout | null;
    private lastFrames: Map<string, Buffer>;
    private storage: StorageService;

    constructor() {
        super();
        this.config = { ...DEFAULT_CONFIG };
        this.captureInterval = null;
        this.lastFrames = new Map();

        const storageConfig: StorageConfig = {
            basePath: 'screenshots',
            format: 'jpeg' as StorageFormat,
            quality: 80,
            maxStorageSize: 1024 * 1024 * 1024, // 1GB
            retentionDays: 30,
            organizationStrategy: 'date',
            namingPattern: '{timestamp}_{display}'
        };

        this.storage = new StorageService(storageConfig);
        this.initializeStorage().catch(error => {
            this.emit('error', error);
        });
    }

    private async initializeStorage(): Promise<void> {
        try {
            await this.storage.init();
            const savedConfig = await this.storage.loadConfig<ScreenshotConfig>('screenshot');
            if (savedConfig) {
                this.config = { ...this.config, ...savedConfig };
            }
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    public getConfig(): ScreenshotConfig {
        return { ...this.config };
    }

    public async getDisplays(): Promise<DisplayInfo[]> {
        const displays = screen.getAllDisplays();
        return displays.map(display => ({
            id: display.id.toString(),
            name: display.label || `Display ${display.id}`,
            bounds: {
                x: display.bounds.x,
                y: display.bounds.y,
                width: display.bounds.width,
                height: display.bounds.height
            },
            isPrimary: display.id === screen.getPrimaryDisplay().id,
        }));
    }

    public async updateConfig(config: Partial<ScreenshotConfig>): Promise<void> {
        try {
            this.config = { ...this.config, ...config };
            await this.storage.saveConfig('screenshot', this.config);
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    public async start(): Promise<void> {
        if (this.captureInterval) {
            return;
        }

        try {
            this.captureInterval = setInterval(async () => {
                try {
                    await this.capture();
                } catch (error) {
                    this.emit('error', error);
                }
            }, this.config.captureInterval);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    public stop(): void {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
    }

    public isCapturing(): boolean {
        return this.captureInterval !== null;
    }

    public async captureNow(): Promise<CaptureResult[]> {
        return this.capture();
    }

    private async capture(): Promise<CaptureResult[]> {
        try {
            const displays = await this.getDisplays();
            const activeDisplays = this.config.activeDisplays || [displays[0].id];
            const results: CaptureResult[] = [];

            for (const display of displays) {
                if (activeDisplays.includes(display.id)) {
                    const result = await this.captureDisplay(display);
                    if (result) {
                        results.push(result);
                    }
                }
            }

            return results;
        } catch (error) {
            console.error('Failed to capture:', error);
            this.emit('error', error);
            throw error;
        }
    }

    private async captureDisplay(display: DisplayInfo): Promise<CaptureResult | null> {
        try {
            const buffer = await screenshot({ screen: display.id });
            const metadata: ScreenshotMetadata = {
                timestamp: Date.now(),
                displayId: display.id,
                width: display.bounds.width,
                height: display.bounds.height,
                format: this.config.format || 'jpeg'
            };

            const processedBuffer = await this.processImage(buffer);

            if (this.config.detectSceneChanges && this.config.sceneChangeThreshold) {
                const lastFrame = this.lastFrames.get(display.id);
                if (lastFrame) {
                    const changeScore = await this.calculateSceneChange(lastFrame, processedBuffer);
                    metadata.previousSceneScore = changeScore;
                    metadata.isSceneChange = changeScore > this.config.sceneChangeThreshold;
                }
                this.lastFrames.set(display.id, processedBuffer);
            }

            return {
                buffer: processedBuffer,
                metadata,
            };
        } catch (error) {
            console.error('Failed to capture display:', error);
            this.emit('error', error);
            throw error;
        }
    }

    private async processImage(buffer: Buffer): Promise<Buffer> {
        try {
            const image = sharp(buffer);

            if (this.config.width || this.config.height) {
                image.resize(this.config.width, this.config.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
            }

            switch (this.config.format) {
                case 'jpeg':
                    return image.jpeg({ quality: this.config.quality || 80 }).toBuffer();
                case 'png':
                    return image.png({ quality: this.config.quality || 80 }).toBuffer();
                case 'webp':
                    return image.webp({ quality: this.config.quality || 80 }).toBuffer();
                default:
                    return image.jpeg({ quality: this.config.quality || 80 }).toBuffer();
            }
        } catch (error) {
            console.error('Failed to process image:', error);
            throw error;
        }
    }

    private async calculateSceneChange(lastFrame: Buffer, currentFrame: Buffer): Promise<number> {
        try {
            const [lastGray, currentGray] = await Promise.all([
                sharp(lastFrame).grayscale().resize(320, 240).raw().toBuffer(),
                sharp(currentFrame).grayscale().resize(320, 240).raw().toBuffer()
            ]);

            let diff = 0;
            for (let i = 0; i < lastGray.length; i++) {
                diff += Math.pow(lastGray[i] - currentGray[i], 2);
            }
            const mse = diff / lastGray.length;
            return Math.min(mse / 255, 1);
        } catch (error) {
            console.error('Failed to calculate scene change:', error);
            throw error;
        }
    }
} 