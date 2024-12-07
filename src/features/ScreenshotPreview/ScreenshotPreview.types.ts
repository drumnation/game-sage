import type { Screenshot } from '../Screenshot/Screenshot.types';

export interface ScreenshotPreviewProps {
    screenshot: Screenshot | null;
    screenshots: Screenshot[];
    currentIndex: number;
    isPlaying: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onPlayPause: () => void;
    onSliderChange: (value: number) => void;
}

export interface PreviewState {
    isFullscreen: boolean;
    isZoomed: boolean;
    zoomLevel: number;
} 