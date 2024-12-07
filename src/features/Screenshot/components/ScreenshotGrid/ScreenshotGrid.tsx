import React from 'react';
import { GridContainer } from './ScreenshotGrid.styles';
import { ScreenshotPreview } from '../ScreenshotPreview';
import type { ScreenshotGridProps } from '../../Screenshot.types';
import type { Screenshot } from '../../Screenshot.types';

export const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({
    screenshots,
    selectedId,
    onSelect
}) => (
    <GridContainer>
        {screenshots.map((screenshot: Screenshot) => (
            <ScreenshotPreview
                key={screenshot.id}
                screenshot={screenshot}
                isSelected={screenshot.id === selectedId}
                onClick={() => onSelect(screenshot.id)}
            />
        ))}
    </GridContainer>
); 