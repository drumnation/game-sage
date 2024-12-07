import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import type { Screenshot } from '../Screenshot.types';

interface CaptureError {
    error: string;
}

interface CaptureFrameData {
    imageData: string;
    metadata: {
        timestamp: number;
        displayId: string;
        format: string;
        width: number;
        height: number;
        isSceneChange?: boolean;
        previousSceneScore?: number;
        isHotkeyCapture?: boolean;
    };
}

export const useScreenshotCapture = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { message } = App.useApp();

    // Load initial display selection from config
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        api.getConfig().then(response => {
            if (response.success && response.data?.activeDisplays?.length) {
                setSelectedDisplays(response.data.activeDisplays);
            }
        });
    }, []);

    const handleCaptureFrame = useCallback((data: CaptureFrameData | CaptureError) => {
        if ('error' in data) {
            message.error(typeof data.error === 'string' ? data.error : 'Capture error');
            return;
        }

        try {
            setScreenshots(prev => {
                // Check if this is a hotkey capture and we already have a frame from this batch
                const isFirstHotkeyFrame = data.metadata.isHotkeyCapture &&
                    !prev.some(s =>
                        s.metadata.isHotkeyCapture &&
                        Math.abs(s.metadata.timestamp - data.metadata.timestamp) < 1000
                    );

                const newScreenshot = {
                    id: `${Date.now()}-${prev.length}`,
                    imageData: `data:image/jpeg;base64,${data.imageData}`,
                    metadata: {
                        timestamp: data.metadata.timestamp,
                        displayId: data.metadata.displayId,
                        format: data.metadata.format,
                        width: data.metadata.width,
                        height: data.metadata.height,
                        isSceneChange: data.metadata.isSceneChange,
                        previousSceneScore: data.metadata.previousSceneScore,
                        isHotkeyCapture: data.metadata.isHotkeyCapture,
                    },
                };

                // Only show toast for the first frame in a hotkey capture batch
                if (isFirstHotkeyFrame) {
                    message.success('Screenshots captured');
                }

                return [...prev, newScreenshot];
            });
        } catch (error) {
            console.error('Failed to process capture frame:', error);
            message.error('Failed to process screenshot');
        }
    }, [message]);

    const handleSettingsChange = useCallback(async (settings: Partial<ScreenshotConfig>) => {
        try {
            const response = await window.electronAPI?.updateConfig(settings);
            if (!response?.success) {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            message.error('Failed to update settings');
            console.error('Settings update error:', error);
        }
    }, [message]);

    const handleDisplaysChange = useCallback((displays: string[]) => {
        setSelectedDisplays(displays);
        handleSettingsChange({ activeDisplays: displays });
    }, [handleSettingsChange]);

    const handleCapture = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        if (!selectedDisplays.length) {
            message.warning('Please select at least one display to capture');
            return;
        }

        try {
            setIsTransitioning(true);

            if (isCapturing) {
                // Stop interval capture
                const response = await api.stopCapture();
                if (!response?.success) {
                    throw new Error('Failed to stop capture');
                }
                setIsCapturing(false);
                message.success('Capture stopped');
            } else {
                // Start interval capture
                const response = await api.startCapture();
                if (!response?.success) {
                    throw new Error('Failed to start capture');
                }
                setIsCapturing(true);
                message.success('Interval capture started');
            }
        } catch (error) {
            message.error(isCapturing ? 'Failed to stop capture' : 'Failed to start capture');
            console.error('Capture error:', error);
            setIsCapturing(false);
        } finally {
            setIsTransitioning(false);
        }
    }, [isCapturing, selectedDisplays.length, message]);

    // Handle single captures (used by hotkey mode)
    const handleSingleCapture = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        if (!selectedDisplays.length) {
            message.warning('Please select at least one display to capture');
            return;
        }

        try {
            setIsTransitioning(true);
            const response = await api.captureNow();
            if (!response?.success) {
                throw new Error('Failed to capture');
            }
            // Don't show any toast here since the frame event will trigger one
        } catch (error) {
            message.error('Failed to capture screenshot');
            console.error('Capture error:', error);
        } finally {
            setIsTransitioning(false);
        }
    }, [selectedDisplays.length, message]);

    // Listen for capture frames
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        // Always listen for capture frames
        // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
        api.on('capture-frame', handleCaptureFrame);

        return () => {
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [handleCaptureFrame]);

    return {
        screenshots,
        currentIndex,
        isCapturing,
        isTransitioning,
        handleDisplaysChange,
        handleSettingsChange,
        handleCapture,
        handleSingleCapture,
        setCurrentIndex,
    };
}; 