export interface HotkeyConfig {
    captureNow: string;
    toggleCapture: string;
}

export type HotkeyAction = keyof HotkeyConfig;

export interface RegisteredHotkey {
    action: HotkeyAction;
    accelerator: string;
    callback: () => void;
} 