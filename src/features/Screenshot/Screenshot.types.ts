import type {
    ScreenshotConfig,
    CaptureFrame,
    CaptureError,
    CaptureFrameMetadata,
    CaptureResult
} from '@electron/types/electron-api';

/**
 * Screenshot metadata containing capture information
 */
export interface ScreenshotMetadata {
    /** Timestamp when the screenshot was taken */
    timestamp: number;
    /** Format of the image (jpeg, png, webp) */
    format: string;
    /** Width of the captured image */
    width: number;
    /** Height of the captured image */
    height: number;
    /** Whether this frame represents a scene change */
    isSceneChange?: boolean;
}

/**
 * Screenshot data structure
 */
export interface Screenshot {
    /** Unique identifier for the screenshot */
    id: string;
    /** Base64 encoded image data with format prefix */
    imageData: string;
    /** Metadata about the screenshot */
    metadata: ScreenshotMetadata;
}

// Re-export the electron types
export type { ScreenshotConfig };
export type { CaptureFrame };
export type { CaptureError };
export type { CaptureFrameMetadata as CaptureMetadata };
export type { CaptureResult };

// Export component props
export interface ScreenshotProps {
    /** Array of captured screenshots */
    screenshots: Screenshot[];
    /** ID of the currently selected screenshot */
    selectedId?: string;
    /** Callback to capture a new screenshot */
    onCapture: () => Promise<void>;
    /** Callback when a screenshot is selected */
    onSelect: (id: string) => void;
    /** Optional error handler */
    onError?: (error: Error) => void;
}

export interface ScreenshotControlsProps {
    /** Callback to capture a new screenshot */
    onCapture: () => Promise<void>;
    /** Whether a capture is in progress */
    isCapturing: boolean;
    /** Current error state */
    error: Error | null;
}

export interface ScreenshotPreviewProps {
    /** Screenshot to display */
    screenshot: Screenshot;
    /** Whether this screenshot is selected */
    isSelected: boolean;
    /** Click handler */
    onClick: () => void;
}

export interface MonitorSelectionProps {
    /** Callback when display selection changes */
    onDisplaysChange: (selectedDisplays: string[]) => void;
}

export interface ScreenshotHookState {
    /** Whether a capture is in progress */
    isCapturing: boolean;
    /** Current error state */
    error: Error | null;
    /** Handler for settings changes */
    handleSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    /** Handler for display selection changes */
    handleDisplaysChange: (selectedDisplays: string[]) => void;
    /** Handler for capturing screenshots */
    handleCapture: () => Promise<void>;
}

export interface ScreenshotGridProps {
    /** Array of screenshots to display */
    screenshots: Screenshot[];
    /** ID of the currently selected screenshot */
    selectedId?: string;
    /** Callback when a screenshot is selected */
    onSelect: (id: string) => void;
}

export interface ScreenshotManagerProps {
    /** Callback to capture a new screenshot */
    onCapture: () => Promise<void>;
    /** Optional error handler */
    onError?: (error: Error) => void;
    /** Whether a capture is in progress */
    isCapturing: boolean;
    /** Current error state */
    error: Error | null;
}

export type { Screenshot as ScreenshotType }; 