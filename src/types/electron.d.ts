import type { ScreenshotConfig } from '../../electron/services/screenshot/types';
import type { HotkeyConfig } from '../../electron/services/hotkey/types';
import type { AIAnalysisRequest, AIAnalysisResponse } from '../../electron/services/ai/types';
import type { DisplayInfo } from '../../electron/services/screenshot/types';

export type ValidChannel = 'capture-frame' | 'main-process-message' | 'capture-hotkey';

export interface CaptureFrameMetadata {
    timestamp: number;
    displayId: string;
    width: number;
    height: number;
    format: string;
    isSceneChange?: boolean;
    previousSceneScore?: number;
}

export type ChannelData<T extends ValidChannel> =
    T extends 'capture-frame' ? { imageData: string; metadata: CaptureFrameMetadata; } :
    T extends 'main-process-message' ? { message: string; timestamp: number; } :
    T extends 'capture-hotkey' ? void :
    never;

export interface ElectronAPI {
    // Event Listeners
    on<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    off<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    removeAllListeners(channel: ValidChannel): void;
    setMaxListeners(n: number): void;

    // Screenshot Management
    updateConfig: (config: Partial<ScreenshotConfig>) => Promise<void>;
    getConfig: () => Promise<ScreenshotConfig>;
    captureNow: () => Promise<void>;
    listDisplays: () => Promise<DisplayInfo[]>;
    startCapture: () => Promise<void>;
    stopCapture: () => Promise<void>;

    // Hotkey Management
    updateHotkey: (action: keyof HotkeyConfig, accelerator: string) => Promise<void>;
    getHotkeys: () => Promise<Partial<HotkeyConfig>>;
    setHotkeyMode: (enabled: boolean) => void;

    // AI Analysis
    analyzeImage: (request: AIAnalysisRequest) => Promise<AIAnalysisResponse>;
}

declare global {
    interface Window {
        electronAPI: ElectronAPI;
        electron: {
            onHotkeyPress: (callback: () => void) => void;
            onHotkeyRelease: (callback: () => void) => void;
            removeHotkeyPress: (callback: () => void) => void;
            removeHotkeyRelease: (callback: () => void) => void;
        };
    }
} 