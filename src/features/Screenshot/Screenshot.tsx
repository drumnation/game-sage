import React, { useState, useCallback, useEffect } from 'react';
import { ScreenshotSettings } from './components/ScreenshotSettings';
import { MonitorSelection } from './components/MonitorSelection';
import { ScreenshotControls } from './components/ScreenshotControls';
import type { ScreenshotProps } from './Screenshot.types';
import { ScreenshotContainer } from './Screenshot.styles';
import type { ScreenshotConfig } from '@electron/types/index';
import { useScreenshotCapture } from './hooks/useScreenshotCapture';

interface SettingsChangeParams extends Partial<ScreenshotConfig> {
    useHotkey?: boolean;
}

export const Screenshot: React.FC<ScreenshotProps> = ({
    onSettingsChange,
    onDisplaysChange,
    onCapture,
    onSingleCapture,
    isCapturing,
    isTransitioning = false,
    isFlashing = false
}) => {
    const [useHotkey, setUseHotkey] = useState(false);
    const [isHotkeyCapturing, setIsHotkeyCapturing] = useState(false);
    const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);
    const { totalCaptures, handleCapture: hookHandleCapture, lastCaptureTime } = useScreenshotCapture();

    const handleSettingsChange = useCallback((settings: SettingsChangeParams) => {
        // Update local state if useHotkey changed
        if ('useHotkey' in settings) {
            setUseHotkey(Boolean(settings.useHotkey));
        }

        // Forward settings changes
        onSettingsChange(settings);
    }, [onSettingsChange]);

    // Combine hook's handleCapture with parent's onCapture
    const handleCapture = useCallback(async () => {
        await hookHandleCapture();
        onCapture();
    }, [hookHandleCapture, onCapture]);

    const handleHotkeyCaptureEvent = useCallback(() => {
        // Prevent captures while recording a new hotkey or if already capturing
        if (isHotkeyCapturing || isRecordingHotkey) return;

        setIsHotkeyCapturing(true);
        onSingleCapture();
        // Reset after a short delay
        setTimeout(() => setIsHotkeyCapturing(false), 500);
    }, [onSingleCapture, isHotkeyCapturing, isRecordingHotkey]);

    // Listen for hotkey events
    useEffect(() => {
        const api = window.electronAPI;
        if (!api || !useHotkey) return;

        // Only add the listener if we're in hotkey mode
        const handler = handleHotkeyCaptureEvent;
        api.on('capture-hotkey', handler);

        // Clean up by removing the listener
        return () => {
            api.off('capture-hotkey', handler);
            // Remove all listeners when component unmounts and hotkey mode is disabled
            if (!useHotkey) {
                api.removeAllListeners('capture-hotkey');
            }
        };
    }, [useHotkey, handleHotkeyCaptureEvent]);

    return (
        <ScreenshotContainer>
            <ScreenshotSettings
                onSettingsChange={handleSettingsChange}
                isCapturing={isCapturing}
                onHotkeyRecordingChange={setIsRecordingHotkey}
                totalCaptures={totalCaptures}
                lastCaptureTime={lastCaptureTime || undefined}
            />
            <MonitorSelection
                onDisplaysChange={onDisplaysChange}
                isCapturing={isCapturing}
            />
            <ScreenshotControls
                onCapture={handleCapture}
                onSingleCapture={onSingleCapture}
                isCapturing={isCapturing}
                isTransitioning={isTransitioning}
                isIntervalMode={!useHotkey}
                isFlashing={isFlashing}
            />
        </ScreenshotContainer>
    );
};

export default Screenshot; 