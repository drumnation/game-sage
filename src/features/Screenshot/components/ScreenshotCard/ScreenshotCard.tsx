import React from 'react';
import { Tag } from 'antd';
import type { ScreenshotCardProps } from './ScreenshotCard.types';
import { StyledScreenshotCard, ImageContainer, CardFooter, SceneIndicators } from './ScreenshotCard.styles';

/**
 * ScreenshotCard molecule component
 * Displays a screenshot with timestamp and selection state
 */
export const ScreenshotCard: React.FC<ScreenshotCardProps> = ({
    imageUrl,
    timestamp,
    isSelected,
    isSceneChange,
    sceneChangeScore,
    onClick
}) => {
    const scorePercentage = sceneChangeScore !== undefined ? Math.round(sceneChangeScore * 100) : undefined;

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
            <CardFooter>
                <div className="timestamp">
                    {new Date(timestamp).toLocaleTimeString()}
                </div>
                {(isSceneChange || scorePercentage !== undefined) && (
                    <SceneIndicators>
                        {isSceneChange && (
                            <Tag color="success">Scene Change</Tag>
                        )}
                        {scorePercentage !== undefined && (
                            <div className={`scene-score ${scorePercentage > 10 ? 'significant' : ''}`}>
                                Δ {scorePercentage}%
                            </div>
                        )}
                    </SceneIndicators>
                )}
            </CardFooter>
        </StyledScreenshotCard>
    );
}; 