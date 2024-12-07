import React from 'react';
import { Card } from 'antd';
import type { ScreenshotPreviewProps } from '../../Screenshot.types';
import { ScreenshotCard, MetadataContainer } from '../../Screenshot.styles';

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
    screenshot,
    isSelected,
    onClick
}) => {
    const { metadata } = screenshot;
    const timestamp = new Date(metadata.timestamp).toLocaleString();

    return (
        <ScreenshotCard
            $isSelected={isSelected}
            onClick={onClick}
            cover={<img src={screenshot.imageData} alt={`Screenshot from ${timestamp}`} />}
        >
            <Card.Meta
                title={timestamp}
                description={
                    <MetadataContainer>
                        <span>{metadata.width}x{metadata.height}</span>
                        <span>{metadata.format}</span>
                    </MetadataContainer>
                }
            />
        </ScreenshotCard>
    );
}; 