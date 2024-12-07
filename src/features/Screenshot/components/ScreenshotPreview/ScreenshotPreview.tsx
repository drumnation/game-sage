import React from 'react';
import { ScreenshotCard } from '../ScreenshotCard';
import type { ScreenshotPreviewProps } from '../../Screenshot.types';

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
    screenshot,
    isSelected,
    onClick
}) => {
    return (
        <ScreenshotCard
            imageUrl={screenshot.imageData}
            timestamp={screenshot.metadata.timestamp}
            isSelected={isSelected}
            onClick={onClick}
        />
    );
}; 