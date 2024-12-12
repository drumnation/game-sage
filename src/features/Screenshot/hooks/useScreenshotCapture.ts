import { useState, useEffect, useCallback, useRef } from 'react';
import { App } from 'antd';
import type { APIResponse, CaptureFrame, CaptureError, AIMemoryEntry } from '@electron/types/index';
import type { Screenshot, ScreenshotConfig } from '../Screenshot.types';
import { useAI } from '../../../hooks/useAI';
import { useDispatch } from 'react-redux';
import { clearPendingAnalysis } from '../../../store/slices/aiSlice';

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
    totalCaptures: number;
    lastCaptureTime: number | null;
}

// Add static ref for toast debouncing that's shared across all instances
const TOAST_DEBOUNCE_TIME = 1000; // 1 second
let lastToastTime = 0;

export const useScreenshotCapture = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isConfigLoaded, setIsConfigLoaded] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);
    const [totalCaptures, setTotalCaptures] = useState(0);
    const lastCaptureRef = useRef<{ timestamp: number, displayId: string, isHotkeyCapture: boolean, processed: boolean } | null>(null);
    const aiMemoryRef = useRef<AIMemoryEntry[]>([]);
    const cleanupRef = useRef<(() => void) | null>(null);
    const { message } = App.useApp();
    const { analyze, currentMode } = useAI();
    const dispatch = useDispatch();

    const showToast = useCallback((type: 'success' | 'error', content: string) => {
        const now = Date.now();
        if (now - lastToastTime > TOAST_DEBOUNCE_TIME) {
            if (type === 'success') {
                message.success(content);
            } else {
                message.error(content);
            }
            lastToastTime = now;
            console.log(`[Frame Handler] Showing ${type} toast: ${content}`);
        } else {
            console.log(`[Frame Handler] Skipping ${type} toast (debounced): ${content}`);
        }
    }, [message]);

    // Add a ref to track if config has been loaded
    const configLoadedRef = useRef(false);

    // Load initial display selection from config
    useEffect(() => {
        const api = window.electronAPI;
        if (!api || configLoadedRef.current) {
            return;
        }

        console.log('Starting config loading process...');
        configLoadedRef.current = true;
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

    const handleCaptureFrame = useCallback((data: CaptureFrame | CaptureError) => {
        try {
            console.log('[Frame Handler] Received frame event:', {
                isError: 'error' in data,
                hasMetadata: 'metadata' in data,
                timestamp: 'metadata' in data ? data.metadata.timestamp : undefined,
                isHotkeyCapture: 'metadata' in data ? data.metadata.isHotkeyCapture : undefined,
                displayId: 'metadata' in data ? data.metadata.displayId : undefined
            });

            // Check if this is a CaptureError
            if ('error' in data || !('metadata' in data)) {
                if ('message' in data) {
                    console.error('[Frame Handler] Capture error:', data.message);
                    showToast('error', data.message);
                } else {
                    console.error('[Frame Handler] Invalid capture data received');
                    showToast('error', 'Failed to process screenshot');
                }
                return;
            }

            // Check if this frame is too close to the last capture
            if (lastCaptureRef.current) {
                const timeDiff = Math.abs(data.metadata.timestamp - lastCaptureRef.current.timestamp);
                const isSameDisplay = data.metadata.displayId === lastCaptureRef.current.displayId;
                const isSameHotkeyState = (data.metadata.isHotkeyCapture ?? false) === lastCaptureRef.current.isHotkeyCapture;

                // Ignore frames that are within 100ms of the last capture for the same display
                if (timeDiff < 100 && isSameDisplay && isSameHotkeyState) {
                    console.log('[Frame Handler] Ignoring duplicate frame capture', {
                        timeDiff,
                        currentTimestamp: data.metadata.timestamp,
                        lastTimestamp: lastCaptureRef.current.timestamp,
                        displayId: data.metadata.displayId,
                        isHotkeyCapture: data.metadata.isHotkeyCapture ?? false
                    });
                    return;
                }
            }

            // Create new screenshot object with unique ID
            const newScreenshot = {
                id: `${data.metadata.timestamp}-${Math.random().toString(36).substring(2, 15)}-${screenshots.length}`,
                imageData: `data:image/jpeg;base64,${data.imageData}`,
                metadata: data.metadata,
            };

            // Update the last capture reference before processing
            lastCaptureRef.current = {
                timestamp: data.metadata.timestamp,
                displayId: data.metadata.displayId,
                isHotkeyCapture: data.metadata.isHotkeyCapture ?? false,
                processed: false // Mark as not processed yet
            };

            // Clear any pending analysis before starting new one
            dispatch(clearPendingAnalysis());

            // Add the new screenshot and trigger AI analysis
            setScreenshots(prev => {
                const updatedScreenshots = [newScreenshot, ...prev];
                return updatedScreenshots;
            });

            // Trigger AI analysis after updating screenshots
            console.log('[Frame Handler] Starting AI analysis for screenshot:', {
                id: newScreenshot.id,
                mode: currentMode,
                memoryCount: aiMemoryRef.current?.length || 0
            });

            // Wait a tick to ensure state is updated
            setTimeout(() => {
                analyze(
                    data.imageData,
                    currentMode,
                    aiMemoryRef.current || [],
                    newScreenshot.id
                ).then(aiResponse => {
                    console.log('[Frame Handler] AI analysis completed:', {
                        id: newScreenshot.id,
                        hasResponse: !!aiResponse,
                        contentLength: aiResponse?.content?.length
                    });

                    if (!aiResponse) {
                        console.log('[Frame Handler] Skipping AI response processing - null response');
                        return;
                    }

                    // Add new memory entry
                    const newMemoryEntry: AIMemoryEntry = {
                        timestamp: Date.now(),
                        summary: aiResponse.summary || '',
                        mode: currentMode
                    };

                    // Update memory array immutably
                    aiMemoryRef.current = [newMemoryEntry, ...(aiMemoryRef.current || [])].slice(0, 10);

                    console.log('[Frame Handler] Updating screenshot with AI response:', {
                        id: newScreenshot.id,
                        memoryCount: aiMemoryRef.current.length
                    });

                    // Update the screenshot with AI response
                    setScreenshots(current => {
                        const index = current.findIndex(s => s.id === newScreenshot.id);
                        if (index === -1) {
                            console.log('[Frame Handler] Screenshot not found for AI update:', newScreenshot.id);
                            return current;
                        }

                        const updated = [...current];
                        updated[index] = {
                            ...updated[index],
                            aiResponse: {
                                content: aiResponse.content,
                                summary: aiResponse.summary || '',
                                role: 'assistant'
                            },
                            aiMemory: [...aiMemoryRef.current]
                        };
                        return updated;
                    });

                    // Mark as processed after successful AI analysis
                    if (lastCaptureRef.current?.timestamp === data.metadata.timestamp) {
                        lastCaptureRef.current = {
                            ...lastCaptureRef.current,
                            processed: true
                        };
                    }
                }).catch((error: Error) => {
                    // Only show error if it's not a duplicate analysis request
                    if (error.message !== 'Duplicate analysis request') {
                        console.error('[Frame Handler] Failed to analyze screenshot:', error);
                        showToast('error', 'Failed to analyze screenshot');
                    }
                });
            }, 0);

            // Increment total captures for all successful captures
            console.log('[Frame Handler] Incrementing total captures');
            setTotalCaptures(prev => prev + 1);

            // Show success message only for hotkey captures
            if (data.metadata.isHotkeyCapture) {
                showToast('success', 'Screenshot captured');
            }
        } catch (error) {
            console.error('[Frame Handler] Error handling capture frame:', error);
            showToast('error', 'Failed to process screenshot');
        }
    }, [showToast, screenshots.length, analyze, currentMode]);

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
            console.log('Starting capture operation, current state:', { isCapturing });

            if (isCapturing) {
                console.log('Attempting to stop capture...');
                // Stop interval capture
                const response = await api.stopCapture();
                if (!response?.success) {
                    throw new Error('Failed to stop capture');
                }
                console.log('Successfully stopped capture, setting isCapturing to false');
                setIsCapturing(false);
            } else {
                console.log('Attempting to start capture...');
                // Start interval capture
                const response = await api.startCapture();
                if (!response?.success) {
                    throw new Error('Failed to start capture');
                }
                console.log('Successfully started capture, setting isCapturing to true');
                setIsCapturing(true);
            }
        } catch (error) {
            console.error('Capture operation failed:', error);
            message.error(isCapturing ? 'Failed to stop capture' : 'Failed to start capture');
            console.log('Setting isCapturing to false due to error');
            setIsCapturing(false);
        } finally {
            console.log('Capture operation completed, final state:', { isCapturing });
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
                if (response?.error === 'Capture in progress' || response?.error === 'Too soon after last capture') {
                    // Silently ignore these errors
                    return;
                }
                throw new Error(response?.error || 'Failed to capture');
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

        // Clean up any existing listener first
        if (cleanupRef.current) {
            console.log('[Frame Handler] Cleaning up existing event listener');
            cleanupRef.current();
            cleanupRef.current = null;
        }

        console.log('[Frame Handler] Setting up capture-frame event listener');

        // Set up new listener
        const listener = (data: CaptureFrame | CaptureError) => handleCaptureFrame(data);
        api.on('capture-frame', listener);

        // Store cleanup function
        cleanupRef.current = () => {
            console.log('[Frame Handler] Cleaning up capture-frame event listener');
            api?.off('capture-frame', listener);
            // Clear pending analysis when unmounting
            dispatch(clearPendingAnalysis());
        };

        // Clean up by removing the listener when component unmounts or deps change
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [handleCaptureFrame, dispatch]); // Add dispatch to dependencies

    // Reset total captures when stopping or starting
    useEffect(() => {
        if (!isCapturing) {
            console.log('Resetting total captures to 0');
            setTotalCaptures(0);
        }
    }, [isCapturing]);

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
        totalCaptures,
        lastCaptureTime: lastCaptureRef.current?.timestamp || null
    };
}; 