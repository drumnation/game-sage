import type { ReactNode } from 'react';
import type { ScreenshotConfig } from '@electron/types';

export type TabKey = 'screenshot' | 'ai';

export interface TabConfig {
    key: TabKey;
    label: string;
    icon: ReactNode;
}

export interface LeftSidebarProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    onDisplaysChange: (displays: string[]) => void;
    onCapture: () => void;
    isCapturing: boolean;
} 