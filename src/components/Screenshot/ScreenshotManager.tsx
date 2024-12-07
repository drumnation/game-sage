import React, { useState, useEffect, useCallback } from 'react';
import { Button, Space, Card, message } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { ScreenshotGrid } from './ScreenshotGrid';
import { ScreenshotSettings } from './ScreenshotSettings';
import type { Screenshot } from './Screenshot.types';
import type {
    ElectronAPI,
    CaptureFrame,
    CaptureError,
    PartialScreenshotConfig
} from '../../../electron/types/electron-api';

declare global {
    interface Window {
        electronAPI: ElectronAPI;
    }
}

const Container = styled.div`
    padding: 20px;
`;

const StyledCard = styled(Card)`
    background: ${props => props.theme.colors.background};
    border-radius: ${props => props.theme.borderRadius};
`;

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

export const ScreenshotManager: React.FC = () => {
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
                <Space size="middle">
                    <Space size="small">
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
                    </Space>
                    <ScreenshotSettings onChange={handleSettingsChange} />
                </Space>
                <ScreenshotGrid
                    screenshots={screenshots}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                />
            </StyledCard>
        </Container>
    );
}; 