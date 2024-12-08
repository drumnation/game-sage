import { screen, systemPreferences } from 'electron';
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { EventEmitter } from 'events';
import type { DisplayInfo, CaptureResult, ScreenshotConfig } from './types';
import { ScreenshotMetadata, DEFAULT_CONFIG } from './types';
import { StorageConfig, StorageFormat } from '../storage/types';
import { StorageService } from '../storage/StorageService';

export class ScreenshotService extends EventEmitter {
    private config: ScreenshotConfig;
    private captureInterval: NodeJS.Timeout | null;
    private lastFrames: Map<string, Buffer>;
    private storage: StorageService;
    private frameCount: number = 0;
    private initialized: boolean = false;

    constructor() {
        super();
        this.config = { ...DEFAULT_CONFIG };
        this.captureInterval = null;
        this.lastFrames = new Map();
        this.frameCount = 0;

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
    }

    public async init(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            console.log('Initializing screenshot service...');
            await this.storage.init();
            const savedConfig = await this.storage.loadConfig<ScreenshotConfig>('screenshot');
            if (savedConfig) {
                console.log('Loaded saved config:', savedConfig);
                this.config = { ...this.config, ...savedConfig };
            } else {
                console.log('No saved config found, using defaults:', this.config);
            }
            this.initialized = true;
            console.log('Screenshot service initialized');
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.init();
        }
    }

    public async getConfig(): Promise<ScreenshotConfig> {
        await this.ensureInitialized();
        console.log('Getting screenshot config:', this.config);
        return { ...this.config };
    }

    public async getDisplays(): Promise<DisplayInfo[]> {
        console.log('Getting displays...');
        const displays = screen.getAllDisplays();
        console.log('Raw Electron displays:', displays.map(d => ({ id: d.id, label: d.label, bounds: d.bounds })));

        const mappedDisplays = displays.map(display => ({
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

        console.log('Mapped displays:', mappedDisplays);
        return mappedDisplays;
    }

    public async updateConfig(config: Partial<ScreenshotConfig>): Promise<void> {
        try {
            const previousDisplays = this.config.activeDisplays;
            this.config = { ...this.config, ...config };
            await this.storage.saveConfig('screenshot', this.config);

            // If active displays changed and we're currently capturing, restart the capture
            if (config.activeDisplays &&
                JSON.stringify(previousDisplays) !== JSON.stringify(config.activeDisplays) &&
                this.isCapturing()) {
                console.log('Display selection changed, restarting capture service...');
                await this.stop();
                await this.start();
            }
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    public async start(): Promise<void> {
        console.log('Starting screenshot service...');

        if (this.captureInterval) {
            console.log('Screenshot service already running');
            return;
        }

        if (process.platform === 'darwin') {
            const hasScreenCapturePermission = systemPreferences.getMediaAccessStatus('screen');
            console.log('Screen capture permission status:', hasScreenCapturePermission);

            if (hasScreenCapturePermission !== 'granted') {
                console.log('Screen capture permission not granted. Please enable in System Preferences > Security & Privacy > Privacy > Screen Recording');
                throw new Error('Screen capture permission required. Please enable in System Preferences.');
            }
        }

        try {
            // Ensure we're not capturing before starting
            await this.stop();

            // Start the interval immediately
            this.captureInterval = setInterval(() => {
                console.log(`[${new Date().toISOString()}] Starting scheduled capture...`);
                this.capture().catch(error => {
                    console.error('Error during scheduled capture:', error);
                    this.emit('error', error);
                });
            }, this.config.captureInterval);

            // Trigger an immediate capture in parallel
            console.log('Triggering immediate capture...');
            this.capture().catch(error => {
                console.error('Error during immediate capture:', error);
                this.emit('error', error);
            });

            console.log(`Screenshot service started with interval: ${this.config.captureInterval}ms`);
        } catch (error) {
            console.error('Failed to start screenshot service:', error);
            this.emit('error', error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        console.log('Stopping screenshot service...');
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
            // Clear any stored frames
            this.lastFrames.clear();
            console.log('Screenshot service stopped');
        } else {
            console.log('Screenshot service was not running');
        }
    }

    public isCapturing(): boolean {
        return this.captureInterval !== null;
    }

    public async captureNow(): Promise<CaptureResult[]> {
        try {
            const displays = await this.getDisplays();
            const activeDisplays = this.config.activeDisplays || [displays[0].id];
            console.log(`[Frame Event] Starting capture. Current frame count: ${this.frameCount}`);

            const results: CaptureResult[] = [];

            for (const display of displays) {
                if (activeDisplays.includes(display.id)) {
                    const result = await this.captureDisplay(display);
                    if (result) {
                        results.push(result);
                        this.frameCount++;
                        console.log(`[Frame Event] Captured frame ${this.frameCount} for display: ${display.id}`);
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

    private async capture(): Promise<CaptureResult[]> {
        try {
            const displays = await this.getDisplays();
            const activeDisplays = this.config.activeDisplays || [displays[0].id];
            console.log('Active displays:', activeDisplays);

            const results: CaptureResult[] = [];

            for (const display of displays) {
                if (activeDisplays.includes(display.id)) {
                    console.log(`Attempting to capture display:`, {
                        id: display.id,
                        name: display.name,
                        bounds: display.bounds,
                        isPrimary: display.isPrimary
                    });

                    const result = await this.captureDisplay(display);
                    if (result) {
                        results.push(result);
                        console.log(`Successfully captured frame for display: ${display.id}`);
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
            // Convert display.id to number for screenshot-desktop
            const displayId = parseInt(display.id);
            if (isNaN(displayId)) {
                throw new Error(`Invalid display ID: ${display.id}`);
            }

            const buffer = await screenshot({ screen: displayId - 1 }); // screenshot-desktop uses 0-based index

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
                imageData: processedBuffer.toString('base64'),
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

            // Always resize to a reasonable size for preview
            image.resize(800, 600, {
                fit: 'inside',
                withoutEnlargement: true
            });

            switch (this.config.format) {
                case 'jpeg':
                    return image.jpeg({ quality: 60 }).toBuffer();
                case 'png':
                    return image.png({ compressionLevel: 8 }).toBuffer();
                case 'webp':
                    return image.webp({ quality: 60 }).toBuffer();
                default:
                    return image.jpeg({ quality: 60 }).toBuffer();
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

    public resetFrameCount(): void {
        this.frameCount = 0;
        console.log('[Frame Event] Frame count reset to 0');
    }
} 