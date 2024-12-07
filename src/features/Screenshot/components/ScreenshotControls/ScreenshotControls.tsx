import React from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CameraOutlined } from '@ant-design/icons';
import type { ScreenshotControlsProps } from '../../Screenshot.types';

export const ScreenshotControls: React.FC<ScreenshotControlsProps> = ({
    onCapture,
    onSingleCapture,
    isCapturing,
    isTransitioning = false,
    isIntervalMode = false
}) => {
    if (isIntervalMode) {
        return (
            <Button
                type={isCapturing ? "default" : "default"}
                danger={isCapturing}
                icon={isCapturing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={onCapture}
                loading={isTransitioning}
                disabled={isTransitioning}
            >
                {isCapturing ? 'Stop Capture' : 'Start Interval Capture'}
            </Button>
        );
    }

    return (
        <Button
            icon={<CameraOutlined />}
            onClick={onSingleCapture}
            loading={isTransitioning}
            disabled={isTransitioning}
        >
            Capture Now
        </Button>
    );
};

export default ScreenshotControls; 