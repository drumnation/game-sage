import React from 'react';
import { Card } from 'antd';
import type { ScreenshotGridProps } from './Screenshot.types';
import { GridContainer, ScreenshotCard } from './Screenshot.styles';

const { Meta } = Card;

export const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({
    screenshots,
    onSelect,
    selectedId,
}) => {
    if (!screenshots.length) {
        return null;
    }

    return (
        <GridContainer>
            {screenshots.map(({ id, imageData, metadata }) => {
                const timestamp = new Date(metadata.timestamp).toLocaleString();
                const dimensions = `${metadata.width}x${metadata.height}`;
                const isSelected = id === selectedId;

                return (
                    <ScreenshotCard
                        key={id}
                        $isSelected={isSelected}
                        onClick={() => onSelect?.(id)}
                        cover={
                            <img
                                src={`data:image/${metadata.format};base64,${imageData}`}
                                alt={`Screenshot from ${timestamp}`}
                            />
                        }
                    >
                        <Meta
                            title={timestamp}
                            description={
                                <>
                                    <div>{dimensions}</div>
                                    {metadata.isSceneChange && (
                                        <div style={{ color: '#1890ff' }}>Scene Change</div>
                                    )}
                                </>
                            }
                        />
                    </ScreenshotCard>
                );
            })}
        </GridContainer>
    );
}; 