import { globalShortcut } from 'electron';
import type { HotkeyAction, RegisteredHotkey } from './types';

const VALID_MODIFIERS = ['Command', 'CommandOrControl', 'Control', 'Ctrl', 'Alt', 'Option', 'AltGr', 'Shift', 'Super'];
const VALID_KEY_PATTERN = /^[A-Z0-9]$|^F[1-9][0-9]?$|^(Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen)$/i;

let hotkeyModeEnabled = true; // Default to enabled
let hotkeyService: HotkeyService | null = null;

export const setHotkeyService = (service: HotkeyService) => {
    hotkeyService = service;
};

export const setHotkeyModeState = (enabled: boolean) => {
    console.log('Setting hotkey mode:', enabled);
    hotkeyModeEnabled = enabled;

    // Always unregister all shortcuts first
    globalShortcut.unregisterAll();

    // Only re-register if enabled
    if (enabled) {
        hotkeyService?.reregisterAll();
    }
};

export const getHotkeyModeState = () => hotkeyModeEnabled;

export class HotkeyService {
    private registeredHotkeys: Map<HotkeyAction, RegisteredHotkey> = new Map();
    private originalCallbacks: Map<HotkeyAction, () => void> = new Map();

    private validateAccelerator(accelerator: string): boolean {
        const parts = accelerator.split('+').map(part => part.trim());
        if (parts.length < 2) return false;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!VALID_MODIFIERS.includes(parts[i])) return false;
        }
        const key = parts[parts.length - 1];
        return VALID_KEY_PATTERN.test(key);
    }

    public reregisterAll(): void {
        // Skip if mode is disabled
        if (!hotkeyModeEnabled) return;

        // Re-register all shortcuts
        this.registeredHotkeys.forEach((hotkey, action) => {
            const originalCallback = this.originalCallbacks.get(action);
            if (originalCallback) {
                globalShortcut.register(hotkey.accelerator, () => {
                    if (hotkeyModeEnabled) {
                        originalCallback();
                    }
                });
            }
        });
    }

    public registerHotkey(action: HotkeyAction, accelerator: string, callback: () => void): void {
        if (!this.validateAccelerator(accelerator)) {
            throw new Error(`Invalid accelerator format: ${accelerator}`);
        }

        // Store the original callback
        this.originalCallbacks.set(action, callback);

        // Unregister existing hotkey if it exists
        this.unregisterHotkey(action);

        // Create the registration
        const registration = {
            action,
            accelerator,
            callback: () => {
                if (hotkeyModeEnabled) {
                    callback();
                }
            }
        };

        this.registeredHotkeys.set(action, registration);

        // Only register with the system if mode is enabled
        if (hotkeyModeEnabled) {
            const success = globalShortcut.register(accelerator, registration.callback);
            if (!success) {
                throw new Error(`Failed to register hotkey: ${accelerator}`);
            }
        }
    }

    public unregisterHotkey(action: HotkeyAction): void {
        const hotkey = this.registeredHotkeys.get(action);
        if (hotkey) {
            globalShortcut.unregister(hotkey.accelerator);
            this.registeredHotkeys.delete(action);
            this.originalCallbacks.delete(action);
        }
    }

    public unregisterAll(): void {
        globalShortcut.unregisterAll();
        this.registeredHotkeys.clear();
        this.originalCallbacks.clear();
    }

    public updateHotkey(action: HotkeyAction, newAccelerator: string): void {
        const originalCallback = this.originalCallbacks.get(action);
        if (!originalCallback) {
            throw new Error(`Hotkey ${action} not found`);
        }

        // Unregister old hotkey
        this.unregisterHotkey(action);

        // Register new hotkey
        this.registerHotkey(action, newAccelerator, originalCallback);
    }

    public isRegistered(action: HotkeyAction): boolean {
        const hotkey = this.registeredHotkeys.get(action);
        if (!hotkey) return false;
        return hotkeyModeEnabled && globalShortcut.isRegistered(hotkey.accelerator);
    }

    public getHotkey(action: HotkeyAction): RegisteredHotkey | undefined {
        return this.registeredHotkeys.get(action);
    }
} 