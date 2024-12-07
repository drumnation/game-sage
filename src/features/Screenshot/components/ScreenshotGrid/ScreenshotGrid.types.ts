import type { Screenshot } from '@features/screenshots/types';

export interface ScreenshotGridProps {
    screenshots: Screenshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
} 