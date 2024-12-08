import React from 'react';
import { Button } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, CameraOutlined } from '@ant-design/icons';
import type { ScreenshotControlsProps } from '../../Screenshot.types';
import styled, { keyframes } from 'styled-components';

const flash = keyframes`
  0% {
    box-shadow: 0 0 5px #1890ff;
    border-color: #1890ff;
  }
  50% {
    box-shadow: 0 0 20px #1890ff;
    border-color: #69c0ff;
  }
  100% {
    box-shadow: 0 0 5px #1890ff;
    border-color: #1890ff;
  }
`;

const FlashingButton = styled(Button) <{ $isFlashing: boolean }>`
  animation: ${props => props.$isFlashing ? flash : 'none'} 0.2s ease-out;
`;

export const ScreenshotControls: React.FC<ScreenshotControlsProps> = ({
    onCapture,
    onSingleCapture,
    isCapturing,
    isTransitioning = false,
    isIntervalMode = false,
    isFlashing = false
}) => {
    if (isIntervalMode) {
        return (
            <FlashingButton
                type={isCapturing ? "default" : "default"}
                danger={isCapturing}
                icon={isCapturing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={onCapture}
                loading={isTransitioning}
                disabled={isTransitioning}
                $isFlashing={isFlashing}
            >
                {isCapturing ? 'Stop Capture' : 'Start Interval Capture'}
            </FlashingButton>
        );
    }

    return (
        <FlashingButton
            icon={<CameraOutlined />}
            onClick={onSingleCapture}
            loading={isTransitioning}
            disabled={isTransitioning}
            $isFlashing={isFlashing}
        >
            Capture Now
        </FlashingButton>
    );
};

export default ScreenshotControls; 