import type { Screenshot } from '@features/Screenshot/Screenshot.types';

export interface ScreenshotPreviewProps {
    screenshot: Screenshot;
    isSelected?: boolean;
    onClick?: () => void;
} 