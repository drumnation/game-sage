import type { ScreenshotConfig, PartialScreenshotConfig } from '@features/screenshots/types';

export interface ScreenshotControlsProps {
    isCapturing: boolean;
    config: ScreenshotConfig;
    onConfigChange: (config: PartialScreenshotConfig) => void;
    onCaptureNow: () => void;
} 