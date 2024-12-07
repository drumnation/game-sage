import type { Screenshot } from '@features/Screenshot/Screenshot.types';

export interface ScreenshotGridProps {
    screenshots: Screenshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
} 