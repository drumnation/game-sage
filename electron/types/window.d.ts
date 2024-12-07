import type { ElectronAPI } from 'index';

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
        electron?: {
            onHotkeyPress: (callback: () => void) => void;
            onHotkeyRelease: (callback: () => void) => void;
            removeHotkeyPress: (callback: () => void) => void;
            removeHotkeyRelease: (callback: () => void) => void;
        };
    }
} 