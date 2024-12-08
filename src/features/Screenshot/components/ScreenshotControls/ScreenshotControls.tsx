import React from 'react';
import { Button, Divider } from 'antd';
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

const ButtonContainer = styled.div`
  margin-top: 32px;
  text-align: center;
`;

const FlashingButton = styled(Button) <{ $isFlashing: boolean }>`
  animation: ${props => props.$isFlashing ? flash : 'none'} 0.2s ease-out;
  height: 48px;
  font-size: 16px;
  padding: 0 24px;

  .anticon {
    font-size: 20px;
  }
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
      <ButtonContainer>
        <Divider />
        <FlashingButton
          type={isCapturing ? "default" : "default"}
          danger={isCapturing}
          icon={isCapturing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={onCapture}
          loading={isTransitioning}
          disabled={isTransitioning}
          $isFlashing={isFlashing}
          size="large"
        >
          {isCapturing ? 'Stop Capture' : 'Start Interval Capture'}
        </FlashingButton>
      </ButtonContainer>
    );
  }

  return (
    <ButtonContainer>
      <Divider />
      <FlashingButton
        icon={<CameraOutlined />}
        onClick={onSingleCapture}
        loading={isTransitioning}
        disabled={isTransitioning}
        $isFlashing={isFlashing}
        size="large"
      >
        Capture Now
      </FlashingButton>
    </ButtonContainer>
  );
};

export default ScreenshotControls; 