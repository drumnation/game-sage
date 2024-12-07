/// <reference types="electron" />

import type { ElectronAPI } from './electron-api';

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

export * from './electron-api';
export * from './electron-localshortcut';
export * from './screenshot-desktop'; 