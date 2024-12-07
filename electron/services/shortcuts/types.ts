export interface ShortcutConfig {
    startCapture: string;
    stopCapture: string;
    captureNow: string;
}

export interface ShortcutAction {
    id: keyof ShortcutConfig;
    label: string;
    defaultShortcut: string;
    description: string;
}

export const DEFAULT_SHORTCUTS: ShortcutConfig = {
    startCapture: process.platform === 'darwin' ? 'Command+Shift+R' : 'Control+Shift+R',
    stopCapture: process.platform === 'darwin' ? 'Command+Shift+R' : 'Control+Shift+R',
    captureNow: process.platform === 'darwin' ? 'Command+Shift+S' : 'Control+Shift+S',
};

export const SHORTCUT_ACTIONS: ShortcutAction[] = [
    {
        id: 'startCapture',
        label: 'Start Capture',
        defaultShortcut: DEFAULT_SHORTCUTS.startCapture,
        description: 'Start continuous screen capture',
    },
    {
        id: 'stopCapture',
        label: 'Stop Capture',
        defaultShortcut: DEFAULT_SHORTCUTS.stopCapture,
        description: 'Stop continuous screen capture',
    },
    {
        id: 'captureNow',
        label: 'Capture Screenshot',
        defaultShortcut: DEFAULT_SHORTCUTS.captureNow,
        description: 'Take a single screenshot',
    },
]; 