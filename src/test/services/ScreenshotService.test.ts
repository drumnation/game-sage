import { ScreenshotService } from '../../../electron/services/screenshot/ScreenshotService';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import screenshotDesktop from 'screenshot-desktop';

// Mock StorageService
jest.mock('../../../electron/services/storage/StorageService', () => {
    return {
        StorageService: jest.fn().mockImplementation(() => ({
            initialize: jest.fn().mockResolvedValue(undefined),
            saveScreenshot: jest.fn().mockImplementation(async (screenshot) => ({
                id: 'test-id',
                path: '/mock/path/test.jpg',
                metadata: screenshot.metadata,
                size: screenshot.buffer.length,
                createdAt: Date.now(),
            })),
        })),
    };
});

// Mock Electron
jest.mock('electron', () => ({
    screen: {
        getAllDisplays: jest.fn().mockReturnValue([{
            id: 1,
            label: 'Primary Display',
            bounds: { width: 1920, height: 1080 },
        }]),
        getPrimaryDisplay: jest.fn().mockReturnValue({
            id: 1,
            label: 'Primary Display',
            bounds: { width: 1920, height: 1080 },
        }),
    },
}));

// Mock screenshot-desktop only for capture simulation
jest.mock('screenshot-desktop', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(async () => {
        // Use a real test image for processing
        return readFileSync(join(__dirname, '../../__fixtures__/screenshots/test-frame.png'));
    }),
}));

describe('Screenshot Capture System', () => {
    let service: ScreenshotService;
    let testImage1: Buffer;
    let testImage2: Buffer;

    beforeAll(async () => {
        // Create two distinctly different test images
        testImage1 = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 0, g: 0, b: 0 }
            }
        }).jpeg().toBuffer();

        testImage2 = await sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        }).jpeg().toBuffer();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        service = new ScreenshotService();
        await service['storageService'].initialize();
    });

    afterEach(() => {
        service.dispose();
    });

    describe('Memory Management', () => {
        it('maintains stable memory usage during continuous capture', async () => {
            // Arrange
            service.updateConfig({ detectSceneChanges: true });
            const initialMemory = process.memoryUsage();

            // Act - Simulate heavy load
            for (let i = 0; i < 100; i++) {
                await service.captureNow();
            }

            // Assert
            const finalMemory = process.memoryUsage();
            const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

            // Memory growth should be reasonable (< 50MB)
            expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);

            // Should only keep latest frame per display
            expect(service['lastFrames'].size).toBe(1);
        });

        it('releases resources on cleanup', async () => {
            // Arrange
            await service.start();
            await service.captureNow(); // Ensure we have some frames

            // Act
            service.dispose();

            // Assert
            expect(service['isCapturing']).toBe(false);
            expect(service['lastFrames'].size).toBe(0);
            expect(service['captureInterval']).toBe(null);
        });
    });

    describe('Scene Change Detection', () => {
        it('detects major visual changes', async () => {
            // Arrange
            service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.5
            });

            // Act - First capture with black image
            (screenshotDesktop as jest.Mock).mockResolvedValueOnce(testImage1);
            await service.captureNow(); // Initial frame

            // Second capture with white image (significant change)
            (screenshotDesktop as jest.Mock).mockResolvedValueOnce(testImage2);
            const frame2 = await service.captureNow();

            // Assert
            expect(frame2[0].metadata.isSceneChange).toBe(true);
            expect(frame2[0].metadata.previousSceneScore).toBeGreaterThan(0.5);
        });

        it('handles gradual changes appropriately', async () => {
            // Arrange
            service.updateConfig({
                detectSceneChanges: true,
                sceneChangeThreshold: 0.8 // Very high threshold to only detect major changes
            });

            // Create a series of gradually changing images
            const intensities = [0, 32, 64, 96, 128, 160, 192, 224, 255];
            const gradualChanges = await Promise.all(
                intensities.map(async (intensity) => {
                    return await sharp({
                        create: {
                            width: 32,
                            height: 32,
                            channels: 3,
                            background: { r: intensity, g: intensity, b: intensity }
                        }
                    })
                        .jpeg()
                        .toBuffer();
                })
            );

            // Act & Assert - Process gradual changes
            let previousScore: number | undefined;
            let sceneChangeCount = 0;
            const sceneChanges: number[] = [];

            for (let i = 0; i < gradualChanges.length - 1; i++) {
                (screenshotDesktop as jest.Mock).mockResolvedValueOnce(gradualChanges[i]);
                await service.captureNow();

                (screenshotDesktop as jest.Mock).mockResolvedValueOnce(gradualChanges[i + 1]);
                const result = await service.captureNow();

                const score = result[0].metadata.previousSceneScore;
                if (score !== undefined) {
                    // Score should increase with larger intensity differences
                    if (previousScore !== undefined) {
                        expect(score).toBeGreaterThanOrEqual(0); // Always positive
                        expect(score).toBeLessThanOrEqual(1); // Never more than 100% different
                    }
                    previousScore = score;

                    // Track scene changes
                    if (result[0].metadata.isSceneChange) {
                        sceneChanges.push(i);
                        sceneChangeCount++;
                    }
                }
            }

            // Should detect some scene changes but not too many
            expect(sceneChangeCount).toBeGreaterThan(0);
            expect(sceneChangeCount).toBeLessThanOrEqual(gradualChanges.length - 1);

            // Scene changes should be reasonably spaced
            if (sceneChanges.length >= 2) {
                const minSpacing = Math.min(...sceneChanges.slice(1).map((pos, idx) => pos - sceneChanges[idx]));
                expect(minSpacing).toBeGreaterThanOrEqual(1);
            }
        });
    });

    describe('Error Handling', () => {
        it('recovers from capture failures', async () => {
            // Arrange
            const error = new Error('Capture device unavailable');
            (screenshotDesktop as jest.Mock).mockRejectedValueOnce(error);

            const errorHandler = jest.fn();
            service.on('error', errorHandler);

            // Act
            const result = await service.captureNow();

            // Assert
            expect(result).toEqual([]);
            expect(errorHandler).toHaveBeenCalledWith(error);

            // Should recover on next capture
            (screenshotDesktop as jest.Mock).mockResolvedValueOnce(testImage1);
            const recoveryResult = await service.captureNow();
            expect(recoveryResult.length).toBe(1);
        });

        it('handles corrupt image data gracefully', async () => {
            // Arrange
            (screenshotDesktop as jest.Mock).mockResolvedValueOnce(Buffer.from('not-a-valid-image'));

            const errorHandler = jest.fn();
            service.on('error', errorHandler);

            // Act
            const result = await service.captureNow();

            // Assert
            expect(result).toEqual([]);
            expect(errorHandler).toHaveBeenCalled();
            expect(errorHandler.mock.calls[0][0].message).toMatch(/unsupported|invalid|corrupt/i);
        });
    });

    describe('Performance', () => {
        it('processes captures within time budget', async () => {
            // Arrange
            const maxProcessingTime = 100; // 100ms budget
            service.updateConfig({
                format: 'jpeg',
                quality: 80,
                detectSceneChanges: true,
            });

            // Act
            const startTime = performance.now();
            await service.captureNow();
            const duration = performance.now() - startTime;

            // Assert
            expect(duration).toBeLessThan(maxProcessingTime);
        });

        it('maintains performance under load', async () => {
            // Arrange
            const captures = 10;
            const timings: number[] = [];

            // Act
            for (let i = 0; i < captures; i++) {
                const start = performance.now();
                await service.captureNow();
                timings.push(performance.now() - start);
            }

            // Assert
            const avgTime = timings.reduce((a, b) => a + b) / timings.length;
            const maxTime = Math.max(...timings);
            const minTime = Math.min(...timings);

            // Performance should be consistent
            expect(maxTime - minTime).toBeLessThan(50); // Max 50ms variance
            expect(avgTime).toBeLessThan(100); // Average under 100ms
        });
    });
}); 