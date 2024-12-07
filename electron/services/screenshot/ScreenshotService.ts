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
import { StorageService } from '../storage/StorageService';
import type { GameContext } from '../storage/types';

export class ScreenshotService extends EventEmitter {
    private config: ScreenshotConfig;
    private captureInterval: NodeJS.Timeout | null = null;
    private lastFrames: Map<string, Buffer> = new Map();
    private _isCapturing: boolean = false;
    private storageService: StorageService;

    constructor(config: Partial<ScreenshotConfig> = {}) {
        super();
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.storageService = new StorageService();
    }

    public isCapturing(): boolean {
        return this._isCapturing;
    }

    public async initialize(): Promise<void> {
        await this.storageService.init();
    }

    public async start(): Promise<void> {
        if (this._isCapturing) return;
        this._isCapturing = true;

        this.captureInterval = setInterval(async () => {
            try {
                const displays = await this.getDisplays();
                for (const display of displays) {
                    const result = await this.captureDisplay(display);
                    if (result) {
                        this.emit('frame', result);
                        await this.storageService.saveScreenshot(result);
                    }
                }
            } catch (error) {
                this.emit('error', error);
            }
        }, this.config.captureInterval);
    }

    public stop(): void {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }
        this._isCapturing = false;
        this.lastFrames.clear();
    }

    public async captureNow(gameContext?: GameContext): Promise<CaptureResult[]> {
        try {
            const displays = await this.getDisplays();
            const results: CaptureResult[] = [];

            for (const display of displays) {
                try {
                    const result = await this.captureDisplay(display);
                    if (result) {
                        results.push(result);
                        await this.storageService.saveScreenshot(result, gameContext);
                    }
                } catch (error) {
                    this.emit('error', error);
                    throw error;
                }
            }

            return results;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    public updateConfig(newConfig: Partial<ScreenshotConfig>): void {
        this.config = { ...this.config, ...newConfig };
        if (this._isCapturing) {
            this.stop();
            this.start();
        }
    }

    private async getDisplays(): Promise<DisplayInfo[]> {
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

            // Process the image with sharp
            try {
                const processedBuffer = await this.processImage(buffer);

                // Detect scene changes if enabled
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
                this.emit('error', error);
                throw error;
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    private async processImage(buffer: Buffer): Promise<Buffer> {
        const sharpInstance = sharp(buffer);

        switch (this.config.format) {
            case 'png':
                return sharpInstance
                    .png({ compressionLevel: this.config.compression })
                    .toBuffer();
            case 'webp':
                return sharpInstance
                    .webp({ quality: this.config.quality })
                    .toBuffer();
            case 'jpeg':
            default:
                return sharpInstance
                    .jpeg({ quality: this.config.quality })
                    .toBuffer();
        }
    }

    private async calculateSceneChange(lastFrame: Buffer, currentFrame: Buffer): Promise<number> {
        // Convert both frames to grayscale and low resolution for faster comparison
        const [lastGray, currentGray] = await Promise.all([
            sharp(lastFrame)
                .greyscale()
                .resize(32, 32, { fit: 'fill' })
                .raw()
                .toBuffer(),
            sharp(currentFrame)
                .greyscale()
                .resize(32, 32, { fit: 'fill' })
                .raw()
                .toBuffer(),
        ]);

        // Calculate pixel differences
        let diffCount = 0;
        const threshold = 10; // Minimum brightness difference to count as changed

        for (let i = 0; i < lastGray.length; i++) {
            if (Math.abs(lastGray[i] - currentGray[i]) > threshold) {
                diffCount++;
            }
        }

        return diffCount / lastGray.length;
    }

    public dispose(): void {
        this.stop();
    }
} 