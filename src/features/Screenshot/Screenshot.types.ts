import type { ScreenshotConfig } from '@electron/types/electron-api';

/**
 * Screenshot metadata containing capture information
 */
export interface ScreenshotMetadata {
    timestamp: number;
    displayId: string;
    format: string;
    width: number;
    height: number;
    isSceneChange?: boolean;
    previousSceneScore?: number;
}

/**
 * Screenshot data structure
 */
export interface Screenshot {
    id: string;
    imageData: string;
    metadata: ScreenshotMetadata;
}

/**
 * Capture frame data structure
 */
export interface CaptureFrameData {
    imageData: string;
    metadata: ScreenshotMetadata;
}

/**
 * Screenshot hook state
 */
export interface ScreenshotHookState {
    screenshots: Screenshot[];
    currentIndex: number;
    isCapturing: boolean;
    selectedDisplays: string[];
    config: Partial<ScreenshotConfig>;
    error: Error | null;
    handleSettingsChange: (settings: Partial<ScreenshotConfig>) => Promise<void>;
    handleDisplaysChange: (selectedDisplays: string[]) => void;
    handleCapture: () => Promise<void>;
}

// Component Props
export interface ScreenshotProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    onDisplaysChange: (selectedDisplays: string[]) => void;
    onCapture: () => void;
    isCapturing: boolean;
}

export interface ScreenshotControlsProps {
    onCapture: () => void;
    isCapturing: boolean;
}

export interface MonitorSelectionProps {
    onDisplaysChange: (selectedDisplays: string[]) => void;
}

export interface ScreenshotSettingsProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
} 