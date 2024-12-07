import React, { useState, useCallback } from 'react';
import type { ScreenshotManagerProps } from '../../Screenshot.types';
import { ScreenshotControls } from '../ScreenshotControls';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ManagerContainer } from './ScreenshotManager.styles';

export const ScreenshotManager: React.FC<ScreenshotManagerProps> = ({ onCapture, onError }) => {
    const [state, setState] = useState({
        isCapturing: false,
        error: null as Error | null
    });

    const handleCapture = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isCapturing: true, error: null }));
            await onCapture?.();
            setState(prev => ({ ...prev, isCapturing: false }));
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to capture screenshot');
            setState(prev => ({ ...prev, isCapturing: false, error: err }));
            onError?.(err);
        }
    }, [onCapture, onError]);

    return (
        <ManagerContainer>
            {state.error && <ErrorDisplay error={state.error} />}
            <ScreenshotControls
                onCapture={handleCapture}
                isCapturing={state.isCapturing}
                error={state.error}
            />
        </ManagerContainer>
    );
}; 