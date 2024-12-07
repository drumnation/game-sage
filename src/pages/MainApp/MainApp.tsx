import React, { useCallback } from 'react';
import { LeftSidebar } from '../../templates/LeftSidebar';
import { CenterPanel } from '../../templates/CenterPanel';
import { useScreenshotCapture } from '../../features/Screenshot/hooks/useScreenshotCapture';
import type { MainAppProps } from './MainApp.types';
import { AppLayout } from './MainApp.styles';

export const MainApp: React.FC<MainAppProps> = ({ onError }) => {
    const {
        screenshots,
        currentIndex,
        isCapturing,
        handleDisplaysChange,
        handleSettingsChange,
        handleCapture,
        setCurrentIndex,
    } = useScreenshotCapture();

    const handlePrevious = useCallback(() => {
        try {
            setCurrentIndex(prev => Math.max(0, prev - 1));
        } catch (error) {
            onError?.(error as Error);
        }
    }, [setCurrentIndex, onError]);

    const handleNext = useCallback(() => {
        try {
            setCurrentIndex(prev => Math.min(screenshots.length - 1, prev + 1));
        } catch (error) {
            onError?.(error as Error);
        }
    }, [screenshots.length, setCurrentIndex, onError]);

    const handlePlayPause = useCallback(() => {
        // TODO: Implement playback functionality
    }, []);

    const handleSliderChange = useCallback((value: number) => {
        try {
            setCurrentIndex(value);
        } catch (error) {
            onError?.(error as Error);
        }
    }, [setCurrentIndex, onError]);

    return (
        <AppLayout>
            <LeftSidebar
                onSettingsChange={handleSettingsChange}
                onDisplaysChange={handleDisplaysChange}
                onCapture={handleCapture}
                isCapturing={isCapturing}
            />
            <CenterPanel
                screenshot={screenshots[currentIndex] || null}
                screenshots={screenshots}
                currentIndex={currentIndex}
                isPlaying={false}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onPlayPause={handlePlayPause}
                onSliderChange={handleSliderChange}
            />
        </AppLayout>
    );
}; 