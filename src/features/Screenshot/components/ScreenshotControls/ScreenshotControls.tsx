import React from 'react';
import { Button } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

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
            type="primary"
            icon={<CameraOutlined />}
            onClick={onCapture}
            loading={isCapturing}
            size="large"
        >
            Capture Screenshot
        </Button>
    );
};

export default ScreenshotControls; 