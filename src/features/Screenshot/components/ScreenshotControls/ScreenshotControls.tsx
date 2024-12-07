import React from 'react';
import { Button } from 'antd';
import { CameraOutlined, PauseCircleOutlined } from '@ant-design/icons';

export interface ScreenshotControlsProps {
    isCapturing: boolean;
    onCapture: () => void;
}

export const ScreenshotControls: React.FC<ScreenshotControlsProps> = ({
    isCapturing,
    onCapture
}) => {
    return (
        <Button
            type={isCapturing ? "default" : "primary"}
            icon={isCapturing ? <PauseCircleOutlined /> : <CameraOutlined />}
            onClick={onCapture}
            danger={isCapturing}
            size="large"
        >
            {isCapturing ? 'Stop Capture' : 'Start Capture'}
        </Button>
    );
};

export default ScreenshotControls; 