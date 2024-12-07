import React from 'react';
import { ControlButton } from './components/ControlButton';
import { ControlsContainer } from './ScreenshotControls.styles';
import type { ScreenshotControlsProps } from '../../Screenshot.types';

export const ScreenshotControls: React.FC<ScreenshotControlsProps> = ({ onCapture, isCapturing }) => {
    return (
        <ControlsContainer>
            <ControlButton
                onClick={onCapture}
                loading={isCapturing}
            />
        </ControlsContainer>
    );
}; 