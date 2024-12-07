import type { ElectronAPI, CaptureFrame, CaptureError, PartialScreenshotConfig } from '../../../../electron/types/electron-api';

export interface Screenshot {
    id: string;
    imageData: string;
    metadata: {
        timestamp: number;
        displayId: string;
        width: number;
        height: number;
        format: string;
    };
}

export interface ScreenshotManagerProps {
    // Add props if needed in the future
}

export type { ElectronAPI, CaptureFrame, CaptureError, PartialScreenshotConfig }; 