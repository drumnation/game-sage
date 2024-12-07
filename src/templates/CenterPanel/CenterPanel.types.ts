import type { Screenshot } from '../../features/Screenshot/Screenshot.types';

export interface CenterPanelProps {
    screenshot: Screenshot | null;
    screenshots: Screenshot[];
    currentIndex: number;
    isPlaying: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onPlayPause: () => void;
    onSliderChange: (value: number) => void;
} 