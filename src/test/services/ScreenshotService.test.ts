import sharp from 'sharp';
import { ScreenshotService } from '../../../electron/services/screenshot/ScreenshotService';
import type { CaptureFrame, CaptureResult } from '@electron/types';

// Type guard for CaptureFrame
const isCaptureFrame = (result: CaptureResult): result is CaptureFrame => {
    return 'buffer' in result && 'metadata' in result;
};

// Type guard for array of CaptureFrames
const isCaptureFrameArray = (results: CaptureResult[]): results is CaptureFrame[] => {
    return results.length > 0 && results.every(isCaptureFrame);
};

// Create a valid test image buffer
const createTestImage = async () => {
    return await sharp({
        create: {
            width: 100,
            height: 100,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
    })
        .jpeg()
        .toBuffer();
};

// Mock StorageService
jest.mock('../../../electron/services/storage/StorageService', () => {
    return {
        StorageService: jest.fn().mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
            loadConfig: jest.fn().mockResolvedValue(null),
            saveConfig: jest.fn().mockResolvedValue(undefined),
            saveScreenshot: jest.fn().mockImplementation(async (screenshot: CaptureFrame) => ({
                id: 'test-id',
                path: '/test/path/screenshot.png',
                metadata: screenshot.metadata,
                size: screenshot.buffer.length,
                createdAt: Date.now()
            }))
        }))
    };
});

// Mock Electron's screen API
jest.mock('electron', () => {
    const primaryDisplay = {
        id: 0,
        label: 'Primary Display',
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
    };
    return {
        screen: {
            getAllDisplays: jest.fn().mockReturnValue([primaryDisplay]),
            getPrimaryDisplay: jest.fn().mockReturnValue(primaryDisplay)
        }
    };
});

// Mock screenshot-desktop
jest.mock('screenshot-desktop', () => {
    let mockBuffer: Buffer;
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(async () => {
            if (!mockBuffer) {
                mockBuffer = await createTestImage();
            }
            return mockBuffer;
        })
    };
});

describe('Screenshot Capture System', () => {
    let service: ScreenshotService;
    let testImageBuffer: Buffer;

    beforeAll(async () => {
        testImageBuffer = await createTestImage();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        service = new ScreenshotService();
    });

    describe('Memory Management', () => {
        it('maintains stable memory usage during continuous capture', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            const captureCount = 10;

            for (let i = 0; i < captureCount; i++) {
                const result = await service.captureNow();
                expect(isCaptureFrameArray(result)).toBe(true);
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
        });

        it('releases resources on cleanup', () => {
            service.stop();
            expect(service['lastFrames'].size).toBe(0);
            expect(service['captureInterval']).toBeNull();
        });
    });

    describe('Scene Change Detection', () => {
        it('detects major visual changes', async () => {
            await service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.5
            });

            const differentImage = await sharp({
                create: {
                    width: 100,
                    height: 100,
                    channels: 4,
                    background: { r: 0, g: 255, b: 0, alpha: 1 }
                }
            })
                .jpeg()
                .toBuffer();

            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot
                .mockResolvedValueOnce(testImageBuffer)
                .mockResolvedValueOnce(differentImage);

            const firstResult = await service.captureNow();
            expect(isCaptureFrameArray(firstResult)).toBe(true);

            const result = await service.captureNow();

            expect(Array.isArray(result)).toBe(true);
            expect(isCaptureFrameArray(result)).toBe(true);
            if (isCaptureFrameArray(result)) {
                expect(result[0].metadata.previousSceneScore).toBeDefined();
                expect(result[0].metadata.isSceneChange).toBeDefined();
            }
        });

        it('handles gradual changes appropriately', async () => {
            await service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.1
            });

            const results = [];
            const screenshot = jest.requireMock('screenshot-desktop').default;

            // Create a series of gradually changing images
            for (let i = 0; i < 5; i++) {
                const gradualImage = await sharp({
                    create: {
                        width: 100,
                        height: 100,
                        channels: 4,
                        background: {
                            r: Math.floor(255 * (1 - i / 4)),
                            g: Math.floor(255 * (i / 4)),
                            b: 0,
                            alpha: 1
                        }
                    }
                })
                    .jpeg()
                    .toBuffer();

                screenshot.mockResolvedValueOnce(gradualImage);
                results.push(await service.captureNow());
            }

            results.forEach((result, index) => {
                expect(Array.isArray(result)).toBe(true);
                if (isCaptureFrameArray(result)) {
                    if (index > 0) {
                        expect(result[0].metadata.previousSceneScore).toBeDefined();
                        expect(result[0].metadata.isSceneChange).toBeDefined();
                    }
                }
            });
        });
    });

    describe('Error Handling', () => {
        it('recovers from capture failures', async () => {
            const mockError = new Error('Capture failed');
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockImplementation(async () => {
                throw mockError;
            });

            await expect(service.captureNow()).rejects.toThrow('Capture failed');
        });

        it('handles corrupt image data gracefully', async () => {
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockResolvedValueOnce(Buffer.from([0, 1, 2, 3])); // Invalid image data

            await expect(service.captureNow()).rejects.toThrow();
        });
    });

    describe('Performance', () => {
        beforeEach(() => {
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockImplementation(async () => testImageBuffer);
        });

        it('processes captures within time budget', async () => {
            const maxProcessingTime = 1000; // 1 second budget
            await service.updateConfig({
                format: 'jpeg',
                quality: 80,
                detectSceneChanges: true
            });

            const start = performance.now();
            const result = await service.captureNow();
            const duration = performance.now() - start;

            expect(duration).toBeLessThan(maxProcessingTime);
            expect(isCaptureFrameArray(result)).toBe(true);
        });

        it('maintains performance under load', async () => {
            const captureCount = 5;
            const maxAverageTime = 1000; // 1 second per capture

            const start = performance.now();
            const captures = Array.from({ length: captureCount }, () => service.captureNow());
            const results = await Promise.all(captures);
            const duration = performance.now() - start;

            expect(duration / captureCount).toBeLessThan(maxAverageTime);
            results.forEach(result => {
                expect(Array.isArray(result)).toBe(true);
                expect(isCaptureFrameArray(result)).toBe(true);
            });
        });
    });
}); 