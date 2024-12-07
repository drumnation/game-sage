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
}); 