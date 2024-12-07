declare module 'electron-localshortcut' {
    import type { BrowserWindow } from 'electron';

    function register(browserWindow: BrowserWindow, accelerator: string, callback: () => void): void;
    function unregister(browserWindow: BrowserWindow, accelerator: string): void;
    function unregisterAll(browserWindow: BrowserWindow): void;
    function isRegistered(browserWindow: BrowserWindow, accelerator: string): boolean;

    const localShortcut: {
        register: typeof register;
        unregister: typeof unregister;
        unregisterAll: typeof unregisterAll;
        isRegistered: typeof isRegistered;
    };
    export = localShortcut;
} 