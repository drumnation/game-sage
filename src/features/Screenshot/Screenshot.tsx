import React from 'react';
import { ScreenshotManager, ScreenshotGrid } from './components';
import { ScreenshotContainer } from './Screenshot.styles';
import type { Screenshot as ScreenshotType } from './Screenshot.types';

interface ScreenshotProps {
    screenshots: ScreenshotType[];
    selectedId?: string;
    onCapture: () => Promise<void>;
    onSelect: (id: string) => void;
    onError?: (error: Error) => void;
}

export const Screenshot: React.FC<ScreenshotProps> = ({
    screenshots,
    selectedId,
    onCapture,
    onSelect,
    onError,
}) => {
    return (
        <ScreenshotContainer>
            <ScreenshotManager
                onCapture={onCapture}
                onError={onError}
            />
            <ScreenshotGrid
                screenshots={screenshots}
                selectedId={selectedId}
                onSelect={onSelect}
            />
        </ScreenshotContainer>
    );
}; 