import React from 'react';
import { ScreenshotPreview, GameAnalysis } from '../../features';
import type { CenterPanelProps } from './CenterPanel.types';
import { PanelContainer, ContentContainer } from './CenterPanel.styles';

export const CenterPanel: React.FC<CenterPanelProps> = (props) => {
    return (
        <PanelContainer>
            <ContentContainer>
                <ScreenshotPreview {...props} />
                <GameAnalysis />
            </ContentContainer>
        </PanelContainer>
    );
}; 