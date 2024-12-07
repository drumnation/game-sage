import type { CaptureFrameMetadata } from '../../../electron/types/electron-api';

export type ScreenshotMetadata = CaptureFrameMetadata;

export interface Screenshot {
    id: string;
    imageData: string;
    metadata: ScreenshotMetadata;
}

export interface ScreenshotManagerProps {
    onCapture?: () => Promise<void>;
    onError?: (error: Error) => void;
}

export interface ScreenshotGridProps {
    screenshots: Screenshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export interface ScreenshotPreviewProps {
    screenshot: Screenshot;
    isSelected?: boolean;
    onClick?: () => void;
}

export interface ScreenshotControlsProps {
    isCapturing: boolean;
    onCapture: () => Promise<void>;
} 