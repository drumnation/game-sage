import { globalShortcut } from 'electron';
import type { HotkeyAction, RegisteredHotkey } from '../../../electron/services/hotkey/types';

const VALID_MODIFIERS = ['Command', 'CommandOrControl', 'Control', 'Ctrl', 'Alt', 'Option', 'AltGr', 'Shift', 'Super'];
const VALID_KEY_PATTERN = /^[A-Z0-9]$|^F[1-9][0-9]?$|^(Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen)$/i;

export class HotkeyService {
    private registeredHotkeys: Map<HotkeyAction, RegisteredHotkey> = new Map();

    private validateAccelerator(accelerator: string): boolean {
        const parts = accelerator.split('+').map(part => part.trim());

        // Must have at least one modifier and one key
        if (parts.length < 2) {
            return false;
        }

        // All parts except the last one must be valid modifiers
        for (let i = 0; i < parts.length - 1; i++) {
            if (!VALID_MODIFIERS.includes(parts[i])) {
                return false;
            }
        }

        // Last part must be a valid key
        const key = parts[parts.length - 1];
        return VALID_KEY_PATTERN.test(key);
    }

    public registerHotkey(action: HotkeyAction, accelerator: string, callback: () => void): void {
        // Check if hotkey is already registered
        if (this.registeredHotkeys.has(action)) {
            return;
        }

        // Validate accelerator format
        if (!this.validateAccelerator(accelerator)) {
            throw new Error(`Invalid accelerator format: ${accelerator}`);
        }

        try {
            // Register the global shortcut
            globalShortcut.register(accelerator, callback);

            // Store the registration
            this.registeredHotkeys.set(action, {
                action,
                accelerator,
                callback
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to register hotkey: ${errorMessage}`);
        }
    }

    public unregisterHotkey(action: HotkeyAction): void {
        const hotkey = this.registeredHotkeys.get(action);
        if (!hotkey) {
            return;
        }

        globalShortcut.unregister(hotkey.accelerator);
        this.registeredHotkeys.delete(action);
    }

    public unregisterAll(): void {
        globalShortcut.unregisterAll();
        this.registeredHotkeys.clear();
    }

    public updateHotkey(action: HotkeyAction, newAccelerator: string): void {
        const hotkey = this.registeredHotkeys.get(action);
        if (!hotkey) {
            throw new Error(`Hotkey ${action} not found`);
        }

        // Unregister old hotkey
        globalShortcut.unregister(hotkey.accelerator);

        // Register new hotkey
        try {
            globalShortcut.register(newAccelerator, hotkey.callback);
            this.registeredHotkeys.set(action, {
                ...hotkey,
                accelerator: newAccelerator
            });
        } catch (error: unknown) {
            // If registration fails, try to restore the old hotkey
            globalShortcut.register(hotkey.accelerator, hotkey.callback);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to update hotkey: ${errorMessage}`);
        }
    }

    public isRegistered(action: HotkeyAction): boolean {
        const hotkey = this.registeredHotkeys.get(action);
        if (!hotkey) {
            return false;
        }
        return globalShortcut.isRegistered(hotkey.accelerator);
    }

    public getHotkey(action: HotkeyAction): RegisteredHotkey | undefined {
        return this.registeredHotkeys.get(action);
    }
} 