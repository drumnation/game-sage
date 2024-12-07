import React from 'react';
import type { Screenshot } from '../ScreenshotManager/ScreenshotManager.types';

interface ScreenshotGridProps {
    screenshots: Screenshot[];
    selectedId?: string;
    onSelect: (id: string) => void;
}

export const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({
    screenshots,
    selectedId,
    onSelect,
}) => {
    return (
        <div data-testid="screenshot-grid">
            {screenshots.map(screenshot => (
                <div
                    key={screenshot.id}
                    onClick={() => onSelect(screenshot.id)}
                    style={{
                        border: selectedId === screenshot.id ? '2px solid blue' : 'none',
                        padding: '8px',
                        cursor: 'pointer'
                    }}
                >
                    Placeholder for screenshot {screenshot.id}
                </div>
            ))}
        </div>
    );
}; 