import React from 'react';
import type { ScreenshotCardProps } from './ScreenshotCard.types';
import { StyledScreenshotCard, ImageContainer } from './ScreenshotCard.styles';

/**
 * ScreenshotCard molecule component
 * Displays a screenshot with timestamp and selection state
 */
export const ScreenshotCard: React.FC<ScreenshotCardProps> = ({
    imageUrl,
    timestamp,
    isSelected,
    onClick
}) => {
    return (
        <StyledScreenshotCard
            $isSelected={isSelected}
            onClick={onClick}
        >
            <ImageContainer>
                <img
                    src={imageUrl}
                    alt={`Screenshot from ${new Date(timestamp).toLocaleString()}`}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            </ImageContainer>
            <div className="timestamp">
                {new Date(timestamp).toLocaleString()}
            </div>
        </StyledScreenshotCard>
    );
}; 