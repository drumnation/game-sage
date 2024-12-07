import React, { useState, useEffect, useCallback } from 'react';
import { Button, message } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { ScreenshotGrid } from '../ScreenshotGrid/ScreenshotGrid';
import { ScreenshotSettings } from '../ScreenshotSettings/ScreenshotSettings';
import type { Screenshot, ScreenshotManagerProps, CaptureFrame, CaptureError, PartialScreenshotConfig } from './ScreenshotManager.types';
import { Container, StyledCard, ButtonContainer, ControlsContainer } from './ScreenshotManager.styles';

function convertCaptureFrameToScreenshot(frame: CaptureFrame): Screenshot {
    return {
        id: `${frame.metadata.timestamp}-${frame.metadata.displayId}`,
        imageData: frame.buffer.toString('base64'),
        metadata: {
            timestamp: frame.metadata.timestamp,
            displayId: frame.metadata.displayId,
            width: frame.metadata.width,
            height: frame.metadata.height,
            format: frame.metadata.format
        },
    };
}

export const ScreenshotManager: React.FC<ScreenshotManagerProps> = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handleFrame = (data: CaptureFrame | CaptureError) => {
            if ('error' in data) {
                message.error(data.error);
                return;
            }
            const screenshot = convertCaptureFrameToScreenshot(data);
            setScreenshots(prev => [...prev, screenshot]);
        };

        window.electronAPI.on('capture-frame', handleFrame);
        return () => {
            window.electronAPI.off('capture-frame', handleFrame);
        };
    }, []);

    const handleStartCapture = useCallback(async () => {
        try {
            await window.electronAPI.updateConfig({ captureInterval: 1000 });
            setIsCapturing(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            message.error(`Failed to start capture: ${errorMessage}`);
        }
    }, []);

    const handleStopCapture = useCallback(async () => {
        try {
            await window.electronAPI.updateConfig({ captureInterval: 0 });
            setIsCapturing(false);
        } catch (error) {
            message.error(`Failed to stop capture: ${error}`);
        }
    }, []);

    const handleCaptureNow = useCallback(async () => {
        try {
            const config = await window.electronAPI.getConfig();
            await window.electronAPI.updateConfig({ ...config, captureInterval: 0 });
        } catch (error) {
            message.error(`Failed to capture: ${error}`);
        }
    }, []);

    const handleSettingsChange = useCallback((settings: PartialScreenshotConfig) => {
        window.electronAPI.updateConfig(settings).catch((error: Error) => {
            message.error(`Failed to update settings: ${error.message}`);
        });
    }, []);

    return (
        <Container>
            <StyledCard>
                <ControlsContainer>
                    <ButtonContainer>
                        <Button
                            data-testid="start-button"
                            type="primary"
                            icon={<CameraOutlined />}
                            onClick={isCapturing ? handleStopCapture : handleStartCapture}
                        >
                            {isCapturing ? 'Stop' : 'Start'}
                        </Button>
                        <Button
                            data-testid="capture-now-button"
                            icon={<CameraOutlined />}
                            onClick={handleCaptureNow}
                        >
                            Capture Now
                        </Button>
                    </ButtonContainer>
                    <ScreenshotSettings onChange={handleSettingsChange} />
                </ControlsContainer>
                <ScreenshotGrid
                    screenshots={screenshots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </StyledCard>
        </Container>
    );
}; 