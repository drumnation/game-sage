declare module 'electron-localshortcut' {
    import type { BrowserWindow } from 'electron';

    namespace electronLocalshortcut {
        function register(browserWindow: BrowserWindow, accelerator: string, callback: () => void): void;
        function unregister(browserWindow: BrowserWindow, accelerator: string): void;
        function unregisterAll(browserWindow: BrowserWindow): void;
        function isRegistered(browserWindow: BrowserWindow, accelerator: string): boolean;
    }

    export = electronLocalshortcut;
} 