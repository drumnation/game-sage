import sharp from 'sharp';
import { ScreenshotService } from '../../../electron/services/screenshot/ScreenshotService';
import type { CaptureFrame, CaptureResult } from '../../../electron/types/electron-api';

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

// Only mock external dependencies
jest.mock('../../../electron/services/storage/StorageService', () => {
    return {
        StorageService: jest.fn().mockImplementation(() => ({
            init: jest.fn().mockResolvedValue(undefined),
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

// Mock Electron's screen API (system boundary)
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

// Mock screenshot-desktop (system boundary)
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
        // Arrange
        jest.clearAllMocks();
        service = new ScreenshotService();
        await service['storage'].init();
    });

    afterEach(() => {
        service.dispose();
    });

    describe('Memory Management', () => {
        it('maintains stable memory usage during continuous capture', async () => {
            // Arrange
            const initialMemory = process.memoryUsage().heapUsed;
            const captureCount = 10;

            // Act
            for (let i = 0; i < captureCount; i++) {
                const result = await service.captureNow();
                expect(isCaptureFrameArray(result)).toBe(true);
            }

            // Assert
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB limit
        });

        it('releases resources on cleanup', () => {
            // Arrange - service is created in beforeEach

            // Act
            service.dispose();

            // Assert
            expect(service['lastFrames'].size).toBe(0);
            expect(service['captureInterval']).toBeNull();
        });
    });

    describe('Scene Change Detection', () => {
        it('detects major visual changes', async () => {
            // Arrange
            service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.5
            });

            // Create a different test image for the second capture
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

            // Act
            const firstResult = await service.captureNow(); // First capture
            expect(isCaptureFrameArray(firstResult)).toBe(true);

            const result = await service.captureNow(); // Second capture

            // Assert
            expect(Array.isArray(result)).toBe(true);
            expect(isCaptureFrameArray(result)).toBe(true);
            if (isCaptureFrameArray(result)) {
                expect(result[0].metadata.previousSceneScore).toBeDefined();
                expect(result[0].metadata.isSceneChange).toBeDefined();
            }
        });

        it('handles gradual changes appropriately', async () => {
            // Arrange
            service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.8
            });

            // Create a series of gradually changing images
            const images = await Promise.all(
                Array.from({ length: 5 }, (_, i) => {
                    const intensity = Math.floor((i / 4) * 255);
                    return sharp({
                        create: {
                            width: 100,
                            height: 100,
                            channels: 4,
                            background: { r: intensity, g: intensity, b: intensity, alpha: 1 }
                        }
                    })
                        .jpeg()
                        .toBuffer();
                })
            );

            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockImplementation(async () => images[0]); // Reset mock
            images.forEach(image => {
                screenshot.mockResolvedValueOnce(image);
            });

            // Act
            const results = [];
            for (let i = 0; i < images.length; i++) {
                const result = await service.captureNow();
                expect(isCaptureFrameArray(result)).toBe(true);
                results.push(result);
            }

            // Assert
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
            // Arrange
            const mockError = new Error('Capture failed');
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockImplementation(async () => {
                throw mockError;
            });

            // Act & Assert
            await expect(service.captureNow()).rejects.toThrow('Capture failed');
        });

        it('handles corrupt image data gracefully', async () => {
            // Arrange
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockResolvedValueOnce(Buffer.from([0, 1, 2, 3])); // Invalid image data

            // Act & Assert
            await expect(service.captureNow()).rejects.toThrow('Input buffer contains unsupported image format');
        });
    });

    describe('Performance', () => {
        beforeEach(() => {
            // Reset screenshot mock to return valid image data
            const screenshot = jest.requireMock('screenshot-desktop').default;
            screenshot.mockImplementation(async () => testImageBuffer);
        });

        it('processes captures within time budget', async () => {
            // Arrange
            const maxProcessingTime = 1000; // 1 second budget
            service.updateConfig({
                format: 'jpeg',
                quality: 80,
                detectSceneChanges: true
            });

            // Act
            const start = performance.now();
            const result = await service.captureNow();
            const duration = performance.now() - start;

            // Assert
            expect(duration).toBeLessThan(maxProcessingTime);
            expect(isCaptureFrameArray(result)).toBe(true);
        });

        it('maintains performance under load', async () => {
            // Arrange
            const captureCount = 5;
            const maxAverageTime = 1000; // 1 second per capture

            // Act
            const start = performance.now();
            const captures = Array.from({ length: captureCount }, () => service.captureNow());
            const results = await Promise.all(captures);
            const duration = performance.now() - start;

            // Assert
            expect(duration / captureCount).toBeLessThan(maxAverageTime);
            results.forEach(result => {
                expect(Array.isArray(result)).toBe(true);
                expect(isCaptureFrameArray(result)).toBe(true);
            });
        });
    });
}); 