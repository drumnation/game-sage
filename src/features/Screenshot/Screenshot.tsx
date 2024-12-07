import React from 'react';
import { ScreenshotSettings } from './components/ScreenshotSettings';
import { MonitorSelection } from './components/MonitorSelection';
import { ScreenshotControls } from './components/ScreenshotControls';
import type { ScreenshotProps } from './Screenshot.types';
import { ScreenshotContainer } from './Screenshot.styles';

export const Screenshot: React.FC<ScreenshotProps> = ({
    onSettingsChange,
    onDisplaysChange,
    onCapture,
    isCapturing,
}) => {
    return (
        <ScreenshotContainer>
            <ScreenshotSettings onSettingsChange={onSettingsChange} />
            <MonitorSelection onDisplaysChange={onDisplaysChange} />
            <ScreenshotControls
                onCapture={onCapture}
                isCapturing={isCapturing}
            />
        </ScreenshotContainer>
    );
}; 