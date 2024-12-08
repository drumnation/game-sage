import { screen, systemPreferences } from 'electron';
import screenshot from 'screenshot-desktop';
import { EventEmitter } from 'events';
import type { DisplayInfo, CaptureResult, ScreenshotConfig } from './types';
import { ScreenshotMetadata, DEFAULT_CONFIG } from './types';
import { StorageConfig, StorageFormat } from '../storage/types';
import { StorageService } from '../storage/StorageService';
import Jimp from 'jimp';

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
        const displays = screen.getAllDisplays();

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

        return mappedDisplays;
    }

    public async updateConfig(config: Partial<ScreenshotConfig>): Promise<void> {
        try {
            const previousDisplays = this.config.activeDisplays;
            const previousInterval = this.config.captureInterval;
            this.config = { ...this.config, ...config };
            await this.storage.saveConfig('screenshot', this.config);

            console.log('Updated config:', {
                previousInterval,
                newInterval: this.config.captureInterval,
                intervalChanged: config.captureInterval && config.captureInterval !== previousInterval
            });

            // If active displays or interval changed and we're currently capturing, restart the capture
            if ((config.activeDisplays &&
                JSON.stringify(previousDisplays) !== JSON.stringify(config.activeDisplays)) ||
                (config.captureInterval && config.captureInterval !== previousInterval)) {
                if (this.isCapturing()) {
                    console.log('Display selection or interval changed, restarting capture service...');
                    await this.stop();
                    await this.start();
                }
            }
        } catch (error) {
            console.error('Failed to update config:', error);
            throw error;
        }
    }

    public async start(): Promise<void> {
        console.log('Starting screenshot service...');
        console.log('Current capture interval:', this.config.captureInterval);

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

            // The interval is already in milliseconds from the config
            const intervalMs = this.config.captureInterval;
            console.log(`Setting up interval capture every ${intervalMs}ms (${intervalMs / 1000} seconds)`);

            // Trigger an immediate capture
            try {
                console.log('Performing initial capture...');
                const results = await this.capture();
                if (results.length > 0) {
                    console.log(`Initial capture successful - captured ${results.length} frames`);
                }
            } catch (error) {
                console.error('Error during initial capture:', error);
                this.emit('error', error);
            }

            // Start the interval after the initial capture
            this.captureInterval = setInterval(async () => {
                try {
                    console.log('Interval triggered - attempting capture...');
                    const results = await this.capture();
                    if (results.length > 0) {
                        console.log(`Successfully captured ${results.length} frames at ${new Date().toISOString()}`);
                    }
                } catch (error) {
                    console.error('Error during scheduled capture:', error);
                    this.emit('error', error);
                }
            }, intervalMs);

            console.log(`Screenshot service started with interval: ${intervalMs}ms (${intervalMs / 1000} seconds)`);
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
            console.log(`Starting capture for displays: ${activeDisplays.join(', ')}`);

            const results: CaptureResult[] = [];

            for (const display of displays) {
                if (activeDisplays.includes(display.id)) {
                    console.log(`Capturing display: ${display.id}`);
                    const result = await this.captureDisplay(display);
                    if (result) {
                        results.push(result);
                        console.log(`Emitting capture frame for display: ${display.id}`);
                        // Emit the capture frame event
                        this.emit('capture-frame', {
                            imageData: result.imageData,
                            metadata: {
                                ...result.metadata,
                                isIntervalCapture: true
                            }
                        });
                    }
                }
            }

            if (results.length > 0) {
                console.log(`Capture completed successfully for ${results.length} displays`);
            } else {
                console.log('No displays were captured');
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
            const image = await Jimp.read(buffer);

            // Always resize to a reasonable size for preview
            image.resize(800, 600, Jimp.RESIZE_BILINEAR);

            switch (this.config.format) {
                case 'jpeg':
                    return image.quality(60).getBufferAsync(Jimp.MIME_JPEG);
                case 'png':
                    return image.deflateLevel(8).getBufferAsync(Jimp.MIME_PNG);
                default:
                    return image.quality(60).getBufferAsync(Jimp.MIME_JPEG);
            }
        } catch (error) {
            console.error('Failed to process image:', error);
            throw error;
        }
    }

    private async calculateSceneChange(lastFrame: Buffer, currentFrame: Buffer): Promise<number> {
        try {
            const [lastImage, currentImage] = await Promise.all([
                Jimp.read(lastFrame),
                Jimp.read(currentFrame)
            ]);

            // Resize and convert to grayscale for comparison
            lastImage.resize(320, 240).grayscale();
            currentImage.resize(320, 240).grayscale();

            let diffCount = 0;
            const threshold = 10; // Pixel difference threshold

            // Compare each pixel
            for (let x = 0; x < 320; x++) {
                for (let y = 0; y < 240; y++) {
                    const lastPixel = Jimp.intToRGBA(lastImage.getPixelColor(x, y));
                    const currentPixel = Jimp.intToRGBA(currentImage.getPixelColor(x, y));

                    // Since the images are grayscale, we can just compare one channel
                    if (Math.abs(lastPixel.r - currentPixel.r) > threshold) {
                        diffCount++;
                    }
                }
            }

            // Calculate percentage of changed pixels
            const totalPixels = 320 * 240;
            return (diffCount / totalPixels) * 100;
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