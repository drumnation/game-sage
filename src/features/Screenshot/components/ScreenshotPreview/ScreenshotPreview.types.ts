import type { Screenshot } from '@features/screenshots/types';

export interface ScreenshotPreviewProps {
    screenshot: Screenshot;
    isSelected?: boolean;
    onClick?: () => void;
} 