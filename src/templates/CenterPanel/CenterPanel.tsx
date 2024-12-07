import React from 'react';
import { ScreenshotPreview } from '../../features/ScreenshotPreview';
import type { CenterPanelProps } from './CenterPanel.types';
import { PanelContainer } from './CenterPanel.styles';

export const CenterPanel: React.FC<CenterPanelProps> = (props) => {
    return (
        <PanelContainer>
            <ScreenshotPreview {...props} />
        </PanelContainer>
    );
}; 