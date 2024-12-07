import React, { useState, useEffect, useRef } from 'react';
import { Space, App } from 'antd';
import { ScreenshotControls, MonitorSelection, ScreenshotSettings } from './components';
import { ScreenshotCard } from './components/ScreenshotCard';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import {
    ScreenshotContainer,
    ScreenshotSider,
    ScreenshotContent,
    GridContainer,
    SettingsPanel,
    ControlsPanel
} from './Screenshot.styles';

interface Screenshot {
    id: string;
    imageData: string;
    timestamp: number;
    displayId: string;
}

interface CaptureFrameMetadata {
    timestamp: number;
    displayId: string;
    format: string;
    width: number;
    height: number;
}

interface CaptureFrameData {
    imageData: string;
    metadata: CaptureFrameMetadata;
}

export const Screenshot: React.FC = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const { message } = App.useApp();
    const screenshotCounter = useRef(0);

    // Effect to handle cleanup on unmount
    useEffect(() => {
        return () => {
            const api = window.electronAPI;
            if (api && isCapturing) {
                // Ensure we stop capturing on unmount
                api.stopCapture()
                    .then(() => {
                        console.log('Successfully stopped capture on unmount');
                        setIsCapturing(false);
                    })
                    .catch(error => {
                        console.error('Failed to stop capture on unmount:', error);
                    });
            }
        };
    }, [isCapturing]);

    // Effect to handle capture frame events
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        const handleCaptureFrame = (data: CaptureFrameData) => {
            console.log('Received capture frame');

            try {
                const screenshot: Screenshot = {
                    id: `${data.metadata.timestamp}-${data.metadata.displayId}-${screenshotCounter.current++}`,
                    imageData: `data:image/jpeg;base64,${data.imageData}`,
                    timestamp: data.metadata.timestamp,
                    displayId: data.metadata.displayId
                };

                setScreenshots(prev => {
                    // Keep only the last 10 screenshots to prevent memory issues
                    const newScreenshots = [screenshot, ...prev].slice(0, 10);
                    return newScreenshots;
                });
            } catch (error) {
                console.error('Error processing screenshot:', error);
                message.error('Failed to process screenshot');
            }
        };

        console.log('Setting up capture frame listener');
        // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
        api.on('capture-frame', handleCaptureFrame);

        return () => {
            console.log('Removing capture frame listener');
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [message]);

    const handleDisplaysChange = (displays: string[]) => {
        setSelectedDisplays(displays);
        window.electronAPI?.updateConfig({ activeDisplays: displays });
    };

    const handleSettingsChange = async (settings: Partial<ScreenshotConfig>) => {
        try {
            await window.electronAPI?.updateConfig(settings);
        } catch (error) {
            console.error('Failed to update settings:', error);
            message.error('Failed to update settings');
        }
    };

    const handleCapture = async () => {
        if (selectedDisplays.length === 0) {
            message.error('No displays selected');
            return;
        }

        try {
            const api = window.electronAPI;
            if (!api) return;

            if (isCapturing) {
                await api.stopCapture();
                setIsCapturing(false);
                message.success('Capture stopped');
            } else {
                await api.startCapture();
                setIsCapturing(true);
                message.success('Capture started');
            }
        } catch (error) {
            console.error('Failed to capture:', error);
            message.error('Failed to capture screenshot');
            setIsCapturing(false);
        }
    };

    console.log('Rendering with screenshots:', screenshots.length);

    return (
        <App>
            <ScreenshotContainer>
                <ScreenshotSider>
                    <SettingsPanel>
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <ScreenshotSettings onSettingsChange={handleSettingsChange} />
                            <MonitorSelection onDisplaysChange={handleDisplaysChange} />
                        </Space>
                    </SettingsPanel>
                    <ControlsPanel>
                        <ScreenshotControls
                            onCapture={handleCapture}
                            isCapturing={isCapturing}
                        />
                    </ControlsPanel>
                </ScreenshotSider>
                <ScreenshotContent>
                    <GridContainer>
                        {screenshots.length > 0 ? (
                            screenshots.map(screenshot => (
                                <ScreenshotCard
                                    key={screenshot.id}
                                    imageUrl={screenshot.imageData}
                                    timestamp={screenshot.timestamp}
                                />
                            ))
                        ) : (
                            <div>No screenshots captured yet</div>
                        )}
                    </GridContainer>
                </ScreenshotContent>
            </ScreenshotContainer>
        </App>
    );
};

export default Screenshot; 