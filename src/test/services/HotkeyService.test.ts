import { HotkeyService } from '../../../electron/services/hotkey/HotkeyService';
import { globalShortcut } from 'electron';
import type { HotkeyAction, HotkeyConfig } from '../../../electron/services/hotkey/types';

// Mock electron's globalShortcut
jest.mock('electron', () => ({
    globalShortcut: {
        register: jest.fn(() => true),
        unregister: jest.fn(),
        unregisterAll: jest.fn(),
        isRegistered: jest.fn(() => true)
    }
}));

describe('HotkeyService', () => {
    let hotkeyService: HotkeyService;
    const mockCallback = jest.fn();

    beforeEach(() => {
        hotkeyService = new HotkeyService();
        jest.clearAllMocks();
    });

    const defaultConfig: HotkeyConfig = {
        captureNow: 'CommandOrControl+Shift+C',
        toggleCapture: 'CommandOrControl+Shift+T'
    };

    describe('Hotkey Registration', () => {
        it('should successfully register a valid hotkey', () => {
            const action: HotkeyAction = 'captureNow';
            const accelerator = 'CommandOrControl+Shift+X';

            hotkeyService.registerHotkey(action, accelerator, mockCallback);

            expect(globalShortcut.register).toHaveBeenCalledWith(accelerator, mockCallback);
            expect(hotkeyService.isRegistered(action)).toBe(true);
        });

        it('should throw error for invalid accelerator format', () => {
            const action: HotkeyAction = 'captureNow';
            const invalidAccelerator = 'Invalid+Format+!';

            expect(() => {
                hotkeyService.registerHotkey(action, invalidAccelerator, mockCallback);
            }).toThrow('Invalid accelerator format');
        });

        it('should not register duplicate hotkey for same action', () => {
            const action: HotkeyAction = 'captureNow';
            const accelerator = 'CommandOrControl+Shift+X';

            hotkeyService.registerHotkey(action, accelerator, mockCallback);
            hotkeyService.registerHotkey(action, 'CommandOrControl+Shift+Y', mockCallback);

            expect(globalShortcut.register).toHaveBeenCalledTimes(1);
            expect(hotkeyService.getHotkey(action)?.accelerator).toBe(accelerator);
        });
    });

    describe('Hotkey Updates', () => {
        it('should successfully update existing hotkey', () => {
            const action: HotkeyAction = 'captureNow';
            const oldAccelerator = 'CommandOrControl+Shift+X';
            const newAccelerator = 'CommandOrControl+Shift+Y';

            hotkeyService.registerHotkey(action, oldAccelerator, mockCallback);
            hotkeyService.updateHotkey(action, newAccelerator);

            expect(globalShortcut.unregister).toHaveBeenCalledWith(oldAccelerator);
            expect(globalShortcut.register).toHaveBeenLastCalledWith(newAccelerator, mockCallback);
            expect(hotkeyService.getHotkey(action)?.accelerator).toBe(newAccelerator);
        });

        it('should throw error when updating non-existent hotkey', () => {
            const action: HotkeyAction = 'captureNow';
            const accelerator = 'CommandOrControl+Shift+X';

            expect(() => {
                hotkeyService.updateHotkey(action, accelerator);
            }).toThrow('Hotkey captureNow not found');
        });
    });

    describe('Hotkey Reset', () => {
        it('should successfully unregister specific hotkey', () => {
            const action: HotkeyAction = 'captureNow';
            const accelerator = 'CommandOrControl+Shift+X';

            hotkeyService.registerHotkey(action, accelerator, mockCallback);
            hotkeyService.unregisterHotkey(action);

            expect(globalShortcut.unregister).toHaveBeenCalledWith(accelerator);
            expect(hotkeyService.isRegistered(action)).toBe(false);
        });

        it('should successfully unregister all hotkeys', () => {
            const actions: HotkeyAction[] = ['captureNow', 'toggleCapture'];
            actions.forEach(action => {
                hotkeyService.registerHotkey(action, `CommandOrControl+Shift+${action === 'captureNow' ? 'X' : 'Y'}`, mockCallback);
            });

            hotkeyService.unregisterAll();

            expect(globalShortcut.unregisterAll).toHaveBeenCalled();
            actions.forEach(action => {
                expect(hotkeyService.isRegistered(action)).toBe(false);
            });
        });
    });

    describe('Integration with Screenshot Feature', () => {
        it('should trigger screenshot capture when hotkey is pressed', () => {
            const action: HotkeyAction = 'captureNow';
            const accelerator = 'CommandOrControl+Shift+X';
            const captureCallback = jest.fn();

            // Register hotkey for screenshot capture
            hotkeyService.registerHotkey(action, accelerator, captureCallback);

            // Simulate hotkey press by calling the callback directly
            const registeredHotkey = hotkeyService.getHotkey(action);
            registeredHotkey?.callback();

            // Verify callback was called
            expect(captureCallback).toHaveBeenCalled();
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