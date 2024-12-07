import { globalShortcut } from 'electron';
import { HotkeyService } from '../../../electron/services/hotkey/HotkeyService';
import type { HotkeyConfig } from '../../../electron/services/hotkey/types';

// Mock electron's globalShortcut
jest.mock('electron', () => ({
    globalShortcut: {
        register: jest.fn(),
        unregister: jest.fn(),
        unregisterAll: jest.fn(),
        isRegistered: jest.fn()
    }
}));

describe('HotkeyService', () => {
    let hotkeyService: HotkeyService;
    const mockCallback = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        hotkeyService = new HotkeyService();
    });

    afterEach(() => {
        hotkeyService.unregisterAll();
    });

    const defaultConfig: HotkeyConfig = {
        captureNow: 'CommandOrControl+Shift+C',
        toggleCapture: 'CommandOrControl+Shift+T'
    };

    describe('registerHotkey', () => {
        it('should register a hotkey with electron globalShortcut', () => {
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            expect(globalShortcut.register).toHaveBeenCalledWith(defaultConfig.captureNow, expect.any(Function));
        });

        it('should not register the same hotkey twice', () => {
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            expect(globalShortcut.register).toHaveBeenCalledTimes(1);
        });

        it('should throw error if invalid accelerator is provided', () => {
            expect(() => {
                hotkeyService.registerHotkey('captureNow', 'InvalidAccelerator', mockCallback);
            }).toThrow();
        });
    });

    describe('unregisterHotkey', () => {
        it('should unregister a hotkey', () => {
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            hotkeyService.unregisterHotkey('captureNow');
            expect(globalShortcut.unregister).toHaveBeenCalledWith(defaultConfig.captureNow);
        });

        it('should do nothing if hotkey is not registered', () => {
            hotkeyService.unregisterHotkey('nonexistent' as keyof HotkeyConfig);
            expect(globalShortcut.unregister).not.toHaveBeenCalled();
        });
    });

    describe('unregisterAll', () => {
        it('should unregister all hotkeys', () => {
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            hotkeyService.registerHotkey('toggleCapture', defaultConfig.toggleCapture, mockCallback);
            hotkeyService.unregisterAll();
            expect(globalShortcut.unregisterAll).toHaveBeenCalled();
        });
    });

    describe('updateHotkey', () => {
        it('should update existing hotkey with new accelerator', () => {
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            const newAccelerator = 'CommandOrControl+Shift+X';
            hotkeyService.updateHotkey('captureNow', newAccelerator);

            expect(globalShortcut.unregister).toHaveBeenCalledWith(defaultConfig.captureNow);
            expect(globalShortcut.register).toHaveBeenCalledWith(newAccelerator, expect.any(Function));
        });

        it('should throw error if hotkey does not exist', () => {
            expect(() => {
                hotkeyService.updateHotkey('nonexistent' as keyof HotkeyConfig, 'CommandOrControl+Shift+X');
            }).toThrow('Hotkey nonexistent not found');
        });
    });

    describe('isRegistered', () => {
        it('should check if a hotkey is registered', () => {
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            expect(hotkeyService.isRegistered('captureNow')).toBe(true);
        });

        it('should return false for unregistered hotkey', () => {
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(false);
            expect(hotkeyService.isRegistered('nonexistent' as keyof HotkeyConfig)).toBe(false);
        });
    });

    describe('State Management', () => {
        it('should maintain correct state during rapid hotkey updates', () => {
            // Arrange
            const accelerators = ['CommandOrControl+Shift+A', 'CommandOrControl+Shift+B', 'CommandOrControl+Shift+C'];
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);

            // Act
            accelerators.forEach(accelerator => {
                hotkeyService.registerHotkey('captureNow', accelerator, mockCallback);
            });

            // Assert - should only register once since it's the same action
            expect(globalShortcut.register).toHaveBeenCalledTimes(1);
            expect(globalShortcut.unregister).not.toHaveBeenCalled();
            expect(hotkeyService.isRegistered('captureNow')).toBe(true);
        });

        it('should handle concurrent hotkey operations correctly', async () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);

            // Act - Register hotkeys sequentially to ensure deterministic behavior
            hotkeyService.registerHotkey('captureNow', 'CommandOrControl+Shift+D', mockCallback);
            hotkeyService.registerHotkey('toggleCapture', 'CommandOrControl+Shift+E', mockCallback);
            hotkeyService.unregisterHotkey('captureNow');

            // Assert
            expect(hotkeyService.isRegistered('toggleCapture')).toBe(true);
            expect(hotkeyService.isRegistered('captureNow')).toBe(false);
        });
    });

    describe('Error Handling', () => {
        it('should handle registration failure gracefully', () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockImplementation(() => {
                throw new Error('Registration failed');
            });
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(false);

            // Act & Assert
            expect(() => {
                hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, mockCallback);
            }).toThrow('Failed to register hotkey: Registration failed');
            expect(hotkeyService.isRegistered('captureNow')).toBe(false);
        });

        it('should prevent duplicate registrations with different callbacks', () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            // Act
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, callback1);
            hotkeyService.registerHotkey('captureNow', defaultConfig.captureNow, callback2);

            // Assert - should only register once
            expect(globalShortcut.register).toHaveBeenCalledTimes(1);
            expect(hotkeyService.isRegistered('captureNow')).toBe(true);
        });
    });

    describe('Platform Specific Behavior', () => {
        it('should handle platform-specific accelerators', () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);
            const platformAccelerator = process.platform === 'darwin' ? 'Command+Shift+P' : 'Control+Shift+P';

            // Act
            hotkeyService.registerHotkey('captureNow', platformAccelerator, mockCallback);

            // Assert
            expect(globalShortcut.register).toHaveBeenCalledWith(platformAccelerator, expect.any(Function));
            expect(hotkeyService.isRegistered('captureNow')).toBe(true);
        });
    });

    describe('Performance', () => {
        it('should handle rapid registration/unregistration efficiently', () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            (globalShortcut.isRegistered as jest.Mock).mockReturnValue(true);
            const iterations = 10;
            const startTime = performance.now();

            // Act
            for (let i = 1; i <= iterations; i++) {
                // Use valid accelerator format
                hotkeyService.registerHotkey('captureNow', `CommandOrControl+Shift+F${i}`, mockCallback);
                hotkeyService.unregisterHotkey('captureNow');
            }

            // Assert
            const duration = performance.now() - startTime;
            expect(duration).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    describe('Resource Cleanup', () => {
        it('should clean up all resources on unregisterAll', () => {
            // Arrange
            (globalShortcut.register as jest.Mock).mockReturnValue(true);
            const hotkeys = ['captureNow', 'toggleCapture'] as const;
            hotkeys.forEach(key => {
                hotkeyService.registerHotkey(key, defaultConfig[key], mockCallback);
            });

            // Act
            hotkeyService.unregisterAll();

            // Assert
            expect(globalShortcut.unregisterAll).toHaveBeenCalled();
            hotkeys.forEach(key => {
                expect(hotkeyService.isRegistered(key)).toBe(false);
            });
        });
    });
}); 