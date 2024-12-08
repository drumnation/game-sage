import { useState, useEffect, useCallback, useRef } from 'react';
import { App } from 'antd';
import type { ScreenshotConfig, APIResponse } from '@electron/types/index';
import type { Screenshot } from '../Screenshot.types';
import { useAI } from '../../../hooks/useAI';

export interface ScreenshotCaptureHook {
    isCapturing: boolean;
    selectedDisplays: string[];
    lastFrame: Screenshot | null;
    startCapture: () => Promise<void>;
    stopCapture: () => Promise<void>;
    handleDisplaysChange: (displays: string[]) => void;
    handleSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    handleCapture: () => Promise<void>;
    isFlashing: boolean;
}

// This type represents how the frame data arrives in the renderer
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
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const lastCaptureRef = useRef<{ timestamp: number, displayId: string } | null>(null);
    const { message } = App.useApp();
    const { analyze } = useAI();

    // Load initial display selection from config
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) {
            console.error('Electron API not available for config loading');
            return;
        }

        console.log('Starting config loading process...');
        api.getConfig().then((response: APIResponse<ScreenshotConfig>) => {
            console.log('Config loading response:', response);
            if (response.success && response.data?.activeDisplays?.length) {
                console.log('Setting active displays:', response.data.activeDisplays);
                setSelectedDisplays(response.data.activeDisplays);
            } else {
                console.log('No active displays in config or config load failed');
            }
            setIsConfigLoaded(true);
            console.log('Config loading complete, isConfigLoaded set to true');
        }).catch(error => {
            console.error('Failed to load config:', error);
            setIsConfigLoaded(true);
            console.log('Config loading failed, isConfigLoaded set to true');
        });
    }, []);

    const triggerFlash = useCallback(() => {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200); // Flash for 200ms
    }, []);

    const handleCaptureFrame = useCallback((data: CaptureFrameData) => {
        try {
            // Check if this frame is too close to the last capture
            if (lastCaptureRef.current) {
                const timeDiff = data.metadata.timestamp - lastCaptureRef.current.timestamp;
                const isSameDisplay = data.metadata.displayId === lastCaptureRef.current.displayId;

                // Ignore frames within 500ms of the last capture from the same display
                if (timeDiff < 500 && isSameDisplay) {
                    console.log('Ignoring duplicate frame capture', {
                        timeDiff,
                        currentTimestamp: data.metadata.timestamp,
                        lastTimestamp: lastCaptureRef.current.timestamp,
                        displayId: data.metadata.displayId
                    });
                    return;
                }
            }

            // Update the last capture reference
            lastCaptureRef.current = {
                timestamp: data.metadata.timestamp,
                displayId: data.metadata.displayId
            };

            // Create new screenshot object
            const newScreenshot = {
                id: `${Date.now()}-${screenshots.length}`,
                imageData: `data:image/jpeg;base64,${data.imageData}`,
                metadata: data.metadata,
            };

            // Add the new screenshot first
            setScreenshots(prev => [...prev, newScreenshot]);

            if (data.metadata.isHotkeyCapture) {
                message.success('Screenshot captured');
                // Trigger AI analysis for hotkey captures
                analyze(data.imageData).then(aiResponse => {
                    setScreenshots(prev => {
                        // Find and update the screenshot with AI response
                        const index = prev.findIndex(s => s.id === newScreenshot.id);
                        if (index === -1) return prev;

                        const updated = [...prev];
                        updated[index] = {
                            ...updated[index],
                            aiResponse
                        };
                        return updated;
                    });
                }).catch((error: Error) => {
                    console.error('Failed to analyze screenshot:', error);
                    message.error('Failed to analyze screenshot');
                });
            }
        } catch (error) {
            console.error('Error handling capture frame:', error);
            message.error('Failed to process screenshot');
        }
    }, [message, analyze, screenshots.length]);

    const handleSettingsChange = useCallback((settings: Partial<ScreenshotConfig>) => {
        const api = window.electronAPI;
        if (!api) return;

        api.updateConfig(settings).catch((error: Error) => {
            console.error('Failed to update settings:', error);
            message.error('Failed to update settings');
        });
    }, [message]);

    const handleDisplaysChange = useCallback((displays: string[]) => {
        setSelectedDisplays(displays);
        handleSettingsChange({ activeDisplays: displays });
    }, [handleSettingsChange]);

    const handleCapture = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        if (!isConfigLoaded) {
            message.warning('Please wait for display configuration to load');
            return;
        }

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
    }, [isCapturing, selectedDisplays.length, isConfigLoaded, message]);

    // Handle single captures (used by hotkey mode)
    const handleSingleCapture = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        if (!isConfigLoaded) {
            message.warning('Please wait for display configuration to load');
            return;
        }

        if (!selectedDisplays.length) {
            message.warning('Please select at least one display to capture');
            return;
        }

        try {
            setIsTransitioning(true);
            triggerFlash(); // Flash the button when hotkey is pressed
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
    }, [selectedDisplays.length, isConfigLoaded, message, triggerFlash]);

    // Listen for capture frames
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        // Set max listeners to prevent warning
        api.setMaxListeners(20);

        // Always listen for capture frames
        api.on('capture-frame', handleCaptureFrame);

        return () => {
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [handleCaptureFrame]);

    return {
        screenshots,
        currentIndex,
        isCapturing,
        isTransitioning,
        selectedDisplays,
        isFlashing,
        handleDisplaysChange,
        handleSettingsChange,
        handleCapture,
        handleSingleCapture,
        setCurrentIndex,
    };
}; 