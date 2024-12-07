import { useState, useCallback } from 'react';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import type { ScreenshotHookState } from '../Screenshot.types';
import { useScreenshotCapture } from './useScreenshotCapture';

interface UseScreenshotProps {
    onCapture: () => Promise<void>;
    onError?: (error: Error) => void;
}

/**
 * Custom hook for managing screenshot capture state and settings
 * This is a wrapper around useScreenshotCapture that adds error handling
 */
export const useScreenshot = ({ onCapture, onError }: UseScreenshotProps): ScreenshotHookState => {
    const [error, setError] = useState<Error | null>(null);
    const {
        screenshots,
        currentIndex,
        isCapturing,
        handleDisplaysChange,
        handleSettingsChange: baseHandleSettingsChange,
        handleCapture: baseHandleCapture,
    } = useScreenshotCapture();

    const handleSettingsChange = useCallback(async (settings: Partial<ScreenshotConfig>) => {
        try {
            await baseHandleSettingsChange(settings);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to update settings');
            setError(error);
            onError?.(error);
        }
    }, [baseHandleSettingsChange, onError]);

    const handleCapture = useCallback(async () => {
        try {
            setError(null);
            await baseHandleCapture();
            await onCapture();
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to capture screenshot');
            setError(error);
            onError?.(error);
        }
    }, [baseHandleCapture, onCapture, onError]);

    return {
        isCapturing,
        error,
        screenshots,
        currentIndex,
        selectedDisplays: [], // Initialize as empty array since it's managed internally
        config: {}, // Config is managed internally by useScreenshotCapture
        handleSettingsChange,
        handleDisplaysChange,
        handleCapture
    };
}; 