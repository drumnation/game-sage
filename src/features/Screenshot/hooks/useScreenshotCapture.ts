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
    };
}

export const useScreenshotCapture = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const { message } = App.useApp();

    const handleCaptureFrame = useCallback((data: CaptureFrameData | CaptureError) => {
        if ('error' in data) {
            message.error(typeof data.error === 'string' ? data.error : 'Capture error');
            return;
        }

        try {
            setScreenshots(prev => [
                ...prev,
                {
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
                    },
                },
            ]);
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
    }, []);

    const handleCapture = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        try {
            if (isCapturing) {
                const response = await api.stopCapture();
                if (!response?.success) {
                    throw new Error('Failed to stop capture');
                }
                setIsCapturing(false);
                message.success('Capture stopped');
            } else {
                if (!selectedDisplays.length) {
                    message.warning('Please select at least one display to capture');
                    return;
                }
                const response = await api.startCapture();
                if (!response?.success) {
                    throw new Error('Failed to start capture');
                }
                setIsCapturing(true);
                message.success('Capture started');
            }
        } catch (error) {
            message.error(isCapturing ? 'Failed to stop capture' : 'Failed to start capture');
            console.error('Capture error:', error);
            setIsCapturing(false);
        }
    }, [isCapturing, selectedDisplays.length, message]);

    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        if (isCapturing) {
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.on('capture-frame', handleCaptureFrame);
        }

        return () => {
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [isCapturing, handleCaptureFrame]);

    return {
        screenshots,
        currentIndex,
        isCapturing,
        handleDisplaysChange,
        handleSettingsChange,
        handleCapture,
        setCurrentIndex,
    };
}; 