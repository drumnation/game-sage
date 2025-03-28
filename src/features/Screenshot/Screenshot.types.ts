import type { ScreenshotConfig as BaseScreenshotConfig, AIResponseWithSummary, AIMemoryEntry } from '@electron/types/index';

// Extend the base ScreenshotConfig type with narrationMode
export interface ScreenshotConfig extends BaseScreenshotConfig {
    narrationMode?: boolean;
    useHotkey?: boolean;
}

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
    isHotkeyCapture?: boolean;
}

/**
 * Screenshot data structure
 */
export interface Screenshot {
    id: string;
    imageData: string;
    metadata: ScreenshotMetadata;
    aiResponse?: AIResponseWithSummary;
    aiMemory?: AIMemoryEntry[];
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
    onSingleCapture: () => void;
    isCapturing: boolean;
    isTransitioning?: boolean;
    isFlashing?: boolean;
    totalCaptures?: number;
}

export interface ScreenshotControlsProps {
    onCapture: () => void;
    onSingleCapture: () => void;
    isCapturing: boolean;
    isTransitioning?: boolean;
    isIntervalMode?: boolean;
    isFlashing?: boolean;
}

export interface MonitorSelectionProps {
    onDisplaysChange: (selectedDisplays: string[]) => void;
    isCapturing?: boolean;
}

export interface ScreenshotSettingsProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig & { useHotkey?: boolean }>) => void;
    isCapturing?: boolean;
    onHotkeyRecordingChange?: (isRecording: boolean) => void;
    totalCaptures?: number;
    lastCaptureTime?: number;
} 