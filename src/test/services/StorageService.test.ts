import { StorageService } from '../../../electron/services/storage/StorageService';
import { DEFAULT_STORAGE_CONFIG } from '../../../electron/services/storage/types';
import type { ScreenshotMetadata } from '../../../electron/services/screenshot/types';
import type { StoredScreenshot } from '../../../electron/services/storage/types';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('fs/promises');
jest.mock('electron', () => ({
    app: {
        getPath: jest.fn().mockReturnValue('/mock/user/data'),
    },
}));
jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        jpeg: () => ({ toFile: jest.fn().mockResolvedValue(undefined) }),
        png: () => ({ toFile: jest.fn().mockResolvedValue(undefined) }),
        webp: () => ({ toFile: jest.fn().mockResolvedValue(undefined) }),
    })),
}));

describe('StorageService', () => {
    let service: StorageService;
    const mockBuffer = Buffer.from('mock-image-data');
    const mockScreenshotMetadata: ScreenshotMetadata = {
        timestamp: Date.now(),
        displayId: 'display1',
        width: 1920,
        height: 1080,
        format: 'jpeg',
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
        (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
        service = new StorageService();
        await service.initialize();
    });

    describe('initialization', () => {
        it('should create base directory if it does not exist', async () => {
            expect(fs.mkdir).toHaveBeenCalledWith(
                path.join('/mock/user/data', DEFAULT_STORAGE_CONFIG.basePath),
                { recursive: true }
            );
        });

        it('should load existing metadata if available', async () => {
            const mockStoredScreenshots: Record<string, StoredScreenshot> = {
                'test-id': {
                    id: 'test-id',
                    path: '/mock/path',
                    metadata: mockScreenshotMetadata,
                    size: 1000,
                    createdAt: Date.now(),
                },
            };

            (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockStoredScreenshots));

            const newService = new StorageService();
            await newService.initialize();

            const screenshot = await newService.getScreenshot('test-id');
            expect(screenshot).toBeDefined();
            expect(screenshot?.id).toBe('test-id');
        });
    });

    describe('saveScreenshot', () => {
        it('should save screenshot and metadata', async () => {
            (fs.stat as jest.Mock).mockResolvedValue({ size: 1000 });
            (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

            const result = await service.saveScreenshot({
                buffer: mockBuffer,
                metadata: mockScreenshotMetadata,
            });

            expect(result).toBeDefined();
            expect(result.metadata).toEqual(mockScreenshotMetadata);
            expect(fs.writeFile).toHaveBeenCalled();
        });

        it('should enforce storage limits', async () => {
            const mockSize = DEFAULT_STORAGE_CONFIG.maxStorageSize + 1000;
            (fs.stat as jest.Mock).mockResolvedValue({ size: mockSize });

            // Save multiple screenshots
            await service.saveScreenshot({ buffer: mockBuffer, metadata: mockScreenshotMetadata });
            await service.saveScreenshot({ buffer: mockBuffer, metadata: mockScreenshotMetadata });

            // Verify cleanup
            const stats = await service.getStats();
            expect(stats.totalSize).toBeLessThanOrEqual(DEFAULT_STORAGE_CONFIG.maxStorageSize);
        });
    });

    describe('deleteScreenshot', () => {
        it('should delete screenshot and update metadata', async () => {
            (fs.stat as jest.Mock).mockResolvedValue({ size: 1000 });

            const saved = await service.saveScreenshot({
                buffer: mockBuffer,
                metadata: mockScreenshotMetadata,
            });

            await service.deleteScreenshot(saved.id);
            const deleted = await service.getScreenshot(saved.id);

            expect(deleted).toBeNull();
            expect(fs.unlink).toHaveBeenCalledWith(saved.path);
        });
    });

    describe('updateConfig', () => {
        it('should update config and migrate files if basePath changes', async () => {
            const newBasePath = 'new-screenshots';

            await service.updateConfig({ basePath: newBasePath });

            expect(fs.mkdir).toHaveBeenCalledWith(
                path.join('/mock/user/data', newBasePath),
                { recursive: true }
            );
        });
    });
}); 