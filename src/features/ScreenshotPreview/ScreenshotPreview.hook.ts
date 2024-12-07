import { useCallback, useState } from 'react';
import type { PreviewState } from './ScreenshotPreview.types';

export const useScreenshotPreview = () => {
    const [state, setState] = useState<PreviewState>({
        isFullscreen: false,
        isZoomed: false,
        zoomLevel: 1,
    });

    const toggleFullscreen = useCallback(() => {
        setState(prev => ({
            ...prev,
            isFullscreen: !prev.isFullscreen,
        }));
    }, []);

    const handleZoom = useCallback((level: number) => {
        setState(prev => ({
            ...prev,
            isZoomed: level !== 1,
            zoomLevel: level,
        }));
    }, []);

    const resetView = useCallback(() => {
        setState({
            isFullscreen: false,
            isZoomed: false,
            zoomLevel: 1,
        });
    }, []);

    return {
        state,
        toggleFullscreen,
        handleZoom,
        resetView,
    } as const;
}; 