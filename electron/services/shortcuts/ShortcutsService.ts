import { BrowserWindow } from 'electron';
import * as electronLocalshortcut from 'electron-localshortcut';
import { EventEmitter } from 'events';
import { ShortcutConfig, DEFAULT_SHORTCUTS } from './types';

export class ShortcutsService extends EventEmitter {
    private shortcuts: ShortcutConfig;
    private window: BrowserWindow | null = null;
    private isCapturing = false;
    private registeredShortcuts: Set<string> = new Set();
    private lastActionTime: { [key: string]: number } = {};
    private readonly DEBOUNCE_MS = 500;

    constructor(config: Partial<ShortcutConfig> = {}) {
        super();
        this.shortcuts = { ...DEFAULT_SHORTCUTS, ...config };
    }

    public setWindow(window: BrowserWindow): void {
        if (this.window) {
            this.unregisterAll();
        }
        this.window = window;
        this.registerAll();
    }

    public updateConfig(config: Partial<ShortcutConfig>): void {
        const oldShortcuts = { ...this.shortcuts };
        this.shortcuts = { ...this.shortcuts, ...config };

        // Only unregister and register shortcuts that have changed
        Object.entries(config).forEach(([key, newShortcut]) => {
            const shortcutKey = key as keyof ShortcutConfig;
            const oldShortcut = oldShortcuts[shortcutKey];
            if (oldShortcut !== newShortcut) {
                this.unregisterShortcut(oldShortcut);
                this.registerShortcut(shortcutKey, newShortcut);
            }
        });
    }

    public unregisterAll(): void {
        if (!this.window) return;

        this.registeredShortcuts.clear();
        electronLocalshortcut.unregisterAll(this.window);
    }

    private registerShortcut(action: keyof ShortcutConfig, accelerator: string): void {
        if (!this.window) return;

        try {
            // Check if shortcut is already registered
            if (electronLocalshortcut.isRegistered(this.window, accelerator)) {
                console.log(`Shortcut ${accelerator} is already registered, skipping`);
                return;
            }

            // Register the shortcut with debouncing
            electronLocalshortcut.register(this.window, accelerator, () => {
                const now = Date.now();
                const lastTime = this.lastActionTime[action] || 0;

                if (now - lastTime < this.DEBOUNCE_MS) {
                    console.log(`Debouncing ${action}, too soon after last action`);
                    return;
                }

                this.lastActionTime[action] = now;

                switch (action) {
                    case 'startCapture':
                    case 'stopCapture':
                        if (this.isCapturing) {
                            this.emit('stopCapture');
                        } else {
                            this.emit('startCapture');
                        }
                        this.isCapturing = !this.isCapturing;
                        break;
                    case 'captureNow':
                        this.emit('captureNow');
                        break;
                }
            });

            this.registeredShortcuts.add(accelerator);
        } catch (error) {
            console.error(`Failed to register shortcut ${accelerator}:`, error);
            this.emit('error', {
                action: 'registerShortcut',
                shortcut: accelerator,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    private unregisterShortcut(accelerator: string): void {
        if (!this.window) return;

        try {
            if (this.registeredShortcuts.has(accelerator)) {
                electronLocalshortcut.unregister(this.window, accelerator);
                this.registeredShortcuts.delete(accelerator);
            }
        } catch (error) {
            console.error(`Failed to unregister shortcut ${accelerator}:`, error);
        }
    }

    private registerAll(): void {
        if (!this.window) return;

        Object.entries(this.shortcuts).forEach(([action, accelerator]) => {
            this.registerShortcut(action as keyof ShortcutConfig, accelerator);
        });
    }

    public dispose(): void {
        this.unregisterAll();
        this.window = null;
        this.removeAllListeners();
    }
} 