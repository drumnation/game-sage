import React from 'react';
import type { ScreenshotCardProps } from './ScreenshotCard.types';
import { StyledScreenshotCard } from './ScreenshotCard.styles';

/**
 * ScreenshotCard molecule component
 * Displays a screenshot with timestamp and selection state
 * 
 * @example
 * ```tsx
 * <ScreenshotCard
 *   imageUrl="path/to/image.jpg"
 *   timestamp={1234567890}
 *   isSelected={false}
 *   onClick={() => console.log('clicked')}
 * />
 * ```
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
            cover={<img src={imageUrl} alt={`Screenshot from ${new Date(timestamp).toLocaleString()}`} />}
        >
            <div className="timestamp">
                {new Date(timestamp).toLocaleString()}
            </div>
        </StyledScreenshotCard>
    );
}; 