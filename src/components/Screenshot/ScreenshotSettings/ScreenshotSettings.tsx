import React, { useCallback } from 'react';
import { Button } from 'antd';
import type { PartialScreenshotConfig } from '../ScreenshotManager/ScreenshotManager.types';

interface ScreenshotSettingsProps {
    onChange: (settings: PartialScreenshotConfig) => void;
}

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({
    onChange,
}) => {
    // Temporary implementation to use onChange and avoid linter errors
    const handleQualityChange = useCallback(() => {
        onChange({ quality: 80 });
    }, [onChange]);

    return (
        <div data-testid="screenshot-settings">
            <Button onClick={handleQualityChange}>
                Set Quality to 80%
            </Button>
        </div>
    );
}; 