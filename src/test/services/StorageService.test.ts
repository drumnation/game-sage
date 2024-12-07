import { StorageService } from '../../../electron/services/storage/StorageService';
import type { CaptureFrame } from '@electron/types';
import type { Stats } from 'fs';
import fs from 'fs/promises';
import sharp from 'sharp';
import path from 'path';

type MockFs = {
    [K in keyof typeof fs]: jest.Mock;
};

jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
    mkdir: jest.fn(),
    rename: jest.fn()
}));

const mockFs = fs as unknown as MockFs;

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

describe('StorageService', () => {
    let service: StorageService;
    let testImageBuffer: Buffer;
    const mockConfig = {
        basePath: 'test/screenshots',
        format: 'jpeg' as const,
        quality: 90,
        maxStorageSize: 1024 * 1024 * 1024, // 1GB
        retentionDays: 30,
        organizationStrategy: 'date' as const,
        namingPattern: '{timestamp}_{scene}'
    };

    beforeAll(async () => {
        testImageBuffer = await createTestImage();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        service = new StorageService(mockConfig);
        // Mock readFile to return empty metadata by default
        mockFs.readFile.mockRejectedValue({ code: 'ENOENT' });
        // Mock mkdir to succeed
        mockFs.mkdir.mockResolvedValue(undefined);
        // Mock writeFile to succeed
        mockFs.writeFile.mockResolvedValue(undefined);
    });

    describe('initialization', () => {
        it('should create base directory if it does not exist', async () => {
            await service.init();
            expect(mockFs.mkdir).toHaveBeenCalledWith(mockConfig.basePath, { recursive: true });
            expect(mockFs.mkdir).toHaveBeenCalledWith(path.join(mockConfig.basePath, 'config'), { recursive: true });
        });

        it('should load existing metadata if available', async () => {
            const mockMetadata = {
                'test-id': {
                    id: 'test-id',
                    path: 'test.jpg',
                    metadata: {
                        timestamp: Date.now(),
                        displayId: '1',
                        width: 1920,
                        height: 1080,
                        format: 'jpeg'
                    },
                    size: 1000,
                    createdAt: Date.now()
                }
            };
            mockFs.readFile.mockResolvedValueOnce(JSON.stringify(mockMetadata));

            await service.init();
            expect(mockFs.readFile).toHaveBeenCalledWith(
                path.join(mockConfig.basePath, 'config', 'metadata.json'),
                'utf-8'
            );
        });
    });

    describe('saveScreenshot', () => {
        it('should save screenshot and metadata', async () => {
            const mockStats: Stats = {
                size: 1000,
                isFile: () => true,
                isDirectory: () => false,
                isBlockDevice: () => false,
                isCharacterDevice: () => false,
                isSymbolicLink: () => false,
                isFIFO: () => false,
                isSocket: () => false,
                dev: 0,
                ino: 0,
                mode: 0,
                nlink: 0,
                uid: 0,
                gid: 0,
                rdev: 0,
                blksize: 0,
                blocks: 0,
                atimeMs: 0,
                mtimeMs: 0,
                ctimeMs: 0,
                birthtimeMs: 0,
                atime: new Date(),
                mtime: new Date(),
                ctime: new Date(),
                birthtime: new Date()
            };
            const mockScreenshot: CaptureFrame = {
                buffer: testImageBuffer,
                metadata: {
                    timestamp: Date.now(),
                    displayId: '1',
                    width: 1920,
                    height: 1080,
                    format: 'jpeg'
                }
            };
            mockFs.stat.mockResolvedValueOnce(mockStats);
            mockFs.writeFile.mockResolvedValue(undefined);
            await service.init();

            const saved = await service.saveScreenshot(mockScreenshot);

            expect(mockFs.writeFile).toHaveBeenCalled();
            expect(saved).toBeDefined();
            expect(saved.id).toBeDefined();
            expect(saved.path).toBeDefined();
            expect(saved.metadata).toEqual(mockScreenshot.metadata);
        });

        it('should enforce storage limits', async () => {
            const mockMetadata = {
                'old-id': {
                    id: 'old-id',
                    path: 'old.jpg',
                    metadata: {
                        timestamp: Date.now() - 1000000,
                        displayId: '1',
                        width: 1920,
                        height: 1080,
                        format: 'jpeg'
                    },
                    size: mockConfig.maxStorageSize + 1,
                    createdAt: Date.now() - 1000000
                }
            };
            mockFs.readFile.mockResolvedValueOnce(JSON.stringify(mockMetadata));

            const mockScreenshot: CaptureFrame = {
                buffer: testImageBuffer,
                metadata: {
                    timestamp: Date.now(),
                    displayId: '1',
                    width: 1920,
                    height: 1080,
                    format: 'jpeg'
                }
            };
            mockFs.stat.mockResolvedValueOnce({ size: 1000 } as Stats);
            mockFs.unlink.mockResolvedValue(undefined);
            await service.init();

            await service.saveScreenshot(mockScreenshot);

            expect(mockFs.unlink).toHaveBeenCalledWith('old.jpg');
        });
    });

    describe('deleteScreenshot', () => {
        it('should delete screenshot and update metadata', async () => {
            const mockMetadata = {
                'test-id': {
                    id: 'test-id',
                    path: 'test.jpg',
                    metadata: {
                        timestamp: Date.now(),
                        displayId: '1',
                        width: 1920,
                        height: 1080,
                        format: 'jpeg'
                    },
                    size: 1000,
                    createdAt: Date.now()
                }
            };
            mockFs.readFile.mockResolvedValueOnce(JSON.stringify(mockMetadata));
            mockFs.unlink.mockResolvedValue(undefined);
            mockFs.writeFile.mockResolvedValue(undefined);

            await service.init();
            await service.deleteScreenshot('test-id');

            expect(mockFs.unlink).toHaveBeenCalledWith('test.jpg');
            expect(mockFs.writeFile).toHaveBeenCalled();
        });
    });

    describe('updateConfig', () => {
        it('should update config and migrate files if basePath changes', async () => {
            const newPath = 'new/path';
            mockFs.mkdir.mockResolvedValue(undefined);
            await service.init();

            await service.updateConfig({ basePath: newPath });

            expect(mockFs.mkdir).toHaveBeenCalledWith(newPath, { recursive: true });
        });
    });
}); 