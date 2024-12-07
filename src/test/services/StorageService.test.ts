import fs from 'fs/promises';
import path from 'path';
import { StorageService } from '../../../electron/services/storage/StorageService';
import type { CaptureResult, CaptureFrame } from '../../../electron/types/electron-api';

jest.mock('fs/promises');
jest.mock('sharp', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        png: jest.fn().mockReturnThis(),
        jpeg: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined)
    })
}));

describe('StorageService', () => {
    let service: StorageService;
    const mockConfig = {
        basePath: '/test/path',
        maxStorageSize: 1000000,
        retentionDays: 30
    };

    const mockScreenshot: CaptureFrame = {
        buffer: Buffer.from('test'),
        metadata: {
            timestamp: Date.now(),
            format: 'png',
            width: 1920,
            height: 1080,
            isSceneChange: false,
            displayId: 'display1'
        }
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
        service = new StorageService(mockConfig);
        await service.init();
    });

    describe('initialization', () => {
        it('should create base directory if it does not exist', async () => {
            expect(fs.mkdir).toHaveBeenCalledWith(mockConfig.basePath, { recursive: true });
        });

        it('should load existing metadata if available', async () => {
            const mockMetadata = {
                'test-id': {
                    id: 'test-id',
                    path: '/test/path/test.png',
                    metadata: mockScreenshot.metadata,
                    size: 1000,
                    createdAt: Date.now()
                }
            };

            (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockMetadata));
            service = new StorageService(mockConfig);
            await service.init();

            const stats = await service.getStorageStats();
            expect(stats.count).toBe(1);
        });
    });

    describe('saveScreenshot', () => {
        it('should save screenshot and metadata', async () => {
            (fs.stat as jest.Mock).mockResolvedValueOnce({ size: 1000 });

            const result = await service.saveScreenshot(mockScreenshot);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('path');
            expect(result).toHaveProperty('metadata');
            expect(fs.writeFile).toHaveBeenCalled();
        });

        it('should enforce storage limits', async () => {
            (fs.stat as jest.Mock).mockResolvedValue({ size: mockConfig.maxStorageSize + 1 });

            await service.saveScreenshot(mockScreenshot);
            const stats = await service.getStorageStats();

            expect(stats.totalSize).toBeLessThanOrEqual(mockConfig.maxStorageSize);
        });
    });

    describe('deleteScreenshot', () => {
        it('should delete screenshot and update metadata', async () => {
            (fs.stat as jest.Mock).mockResolvedValueOnce({ size: 1000 });
            const saved = await service.saveScreenshot(mockScreenshot);

            await service.deleteScreenshot(saved.id);

            expect(fs.unlink).toHaveBeenCalledWith(saved.path);
            const stats = await service.getStorageStats();
            expect(stats.count).toBe(0);
        });
    });

    describe('updateConfig', () => {
        it('should update config and migrate files if basePath changes', async () => {
            const newBasePath = '/new/test/path';
            (fs.stat as jest.Mock).mockResolvedValueOnce({ size: 1000 });
            const saved = await service.saveScreenshot(mockScreenshot);

            await service.updateConfig({ basePath: newBasePath });

            expect(fs.mkdir).toHaveBeenCalledWith(newBasePath, { recursive: true });
            expect(fs.rename).toHaveBeenCalledWith(
                expect.stringContaining('/test/path'),
                expect.stringContaining('/new/test/path')
            );
        });
    });
}); 