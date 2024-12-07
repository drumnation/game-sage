import type { CaptureFrameMetadata as ScreenshotMetadata, ScreenshotConfig, PartialScreenshotConfig } from '../../../electron/types/electron-api';

export type { ScreenshotMetadata, ScreenshotConfig, PartialScreenshotConfig };

export interface Screenshot {
    id: string;
    imageData: string;
    metadata: ScreenshotMetadata;
}

export interface ScreenshotGridProps {
    screenshots: Screenshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export interface ScreenshotPreviewProps {
    screenshot: Screenshot;
}

export interface ScreenshotControlsProps {
    isCapturing: boolean;
    config: ScreenshotConfig;
    onConfigChange: (config: PartialScreenshotConfig) => void;
}

export interface ScreenshotSettingsProps {
    onChange: (settings: PartialScreenshotConfig) => void;
} 