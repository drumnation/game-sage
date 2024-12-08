import type { ElectronAPI } from '../../electron/types';

declare global {
    interface Window {
        electronAPI: ElectronAPI & {
            setHotkeyMode(enabled: boolean): void;
        };
    }
} 