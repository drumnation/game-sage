import { useState, useCallback } from 'react';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import type { ScreenshotHookState } from '../Screenshot.types';

interface UseScreenshotProps {
    onCapture: () => Promise<void>;
    onError?: (error: Error) => void;
}

/**
 * Custom hook for managing screenshot capture state and settings
 */
export const useScreenshot = ({ onCapture, onError }: UseScreenshotProps): ScreenshotHookState => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const handleSettingsChange = useCallback(async (settings: Partial<ScreenshotConfig>) => {
        try {
            await window.electronAPI?.updateConfig(settings);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update settings');
            setError(error);
            onError?.(error);
        }
    }, [onError]);

    const handleDisplaysChange = useCallback((selectedDisplays: string[]) => {
        window.electronAPI?.updateConfig({
            activeDisplays: selectedDisplays
        });
    }, []);

    const handleCapture = useCallback(async () => {
        try {
            setIsCapturing(true);
            setError(null);
            await onCapture();
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to capture screenshot');
            setError(error);
            onError?.(error);
        } finally {
            setIsCapturing(false);
        }
    }, [onCapture, onError]);

    return {
        isCapturing,
        error,
        handleSettingsChange,
        handleDisplaysChange,
        handleCapture
    };
}; 