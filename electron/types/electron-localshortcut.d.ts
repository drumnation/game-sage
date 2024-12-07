declare module 'electron-localshortcut' {
    import { BrowserWindow } from 'electron';

    /**
     * Register a shortcut for a specific window
     * @param browserWindow The window to register the shortcut for
     * @param accelerator The keyboard shortcut to register
     * @param callback The function to call when the shortcut is triggered
     */
    export function register(
        browserWindow: BrowserWindow,
        accelerator: string,
        callback: () => void
    ): void;

    /**
     * Unregister a shortcut for a specific window
     * @param browserWindow The window to unregister the shortcut from
     * @param accelerator The keyboard shortcut to unregister
     */
    export function unregister(
        browserWindow: BrowserWindow,
        accelerator: string
    ): void;

    /**
     * Unregister all shortcuts for a specific window
     * @param browserWindow The window to unregister all shortcuts from
     */
    export function unregisterAll(browserWindow: BrowserWindow): void;

    /**
     * Check if a shortcut is registered for a specific window
     * @param browserWindow The window to check
     * @param accelerator The keyboard shortcut to check
     */
    export function isRegistered(
        browserWindow: BrowserWindow,
        accelerator: string
    ): boolean;
} 