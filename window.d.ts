import { GameMode } from './src/services/ai/types';
import {
    APIResponse,
    ScreenshotConfig,
    DisplayInfo,
    ValidChannel,
    ChannelData,
    CaptureResult
} from './electron/types';

interface AIAnalysisRequest {
    imageBase64: string;
    mode: GameMode;
    gameInfo?: {
        name: string;
        identifier: string;
        customInstructions?: string[];
    };
    customInstructions?: string[];
}

interface AIAnalysisResponse {
    content: string;
    role: 'assistant' | 'user' | 'system';
}

export interface ElectronAPI {
    // Event Listeners
    on<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    off<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void): void;
    removeAllListeners(channel: ValidChannel): void;
    setMaxListeners(n: number): void;

    // Screenshot Management
    updateConfig(config: Partial<ScreenshotConfig>): Promise<APIResponse<void>>;
    getConfig(): Promise<APIResponse<ScreenshotConfig>>;
    captureNow(): Promise<APIResponse<CaptureResult[]>>;
    listDisplays(): Promise<APIResponse<DisplayInfo[]>>;
    startCapture(): Promise<APIResponse<void>>;
    stopCapture(): Promise<APIResponse<void>>;

    // Hotkey Management
    updateHotkey(action: string, accelerator: string): Promise<APIResponse<void>>;
    getHotkeys(): Promise<APIResponse<{ [key: string]: string }>>;
    setHotkeyMode(enabled: boolean): Promise<APIResponse<void>>;
    getHotkeyMode(): Promise<APIResponse<boolean>>;

    // AI Analysis
    analyzeImage(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
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