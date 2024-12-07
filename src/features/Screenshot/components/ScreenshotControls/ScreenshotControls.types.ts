export interface ScreenshotControlsProps {
    isCapturing: boolean;
    onCapture: () => Promise<void>;
} 