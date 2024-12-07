import React, { useState, useEffect, useRef } from 'react';
import { Space, App } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { ScreenshotControls, MonitorSelection, ScreenshotSettings } from './components';
import { ScreenshotCard } from './components/ScreenshotCard';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import {
    ScreenshotContainer,
    ScreenshotSider,
    ScreenshotContent,
    MainPreviewContainer,
    TimelineContainer,
    TimelineItem,
    NoScreenshotsMessage,
    ControlsPanel,
    GameAdviceContainer
} from './Screenshot.styles';

interface Screenshot {
    id: string;
    imageData: string;
    timestamp: number;
    displayId: string;
}

interface CaptureFrameData {
    imageData: string;
    metadata: {
        timestamp: number;
        displayId: string;
        format: string;
        width: number;
        height: number;
    };
}

export const Screenshot: React.FC = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
    const { message } = App.useApp();
    const screenshotCounter = useRef(0);

    // Effect to handle cleanup on unmount
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        // Set max listeners to prevent warning
        api.setMaxListeners(15);

        return () => {
            if (isCapturing) {
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

        console.log('Setting up capture frame listener');

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
                    const newScreenshots = [screenshot, ...prev].slice(0, 10);
                    return newScreenshots;
                });

                // Automatically select the latest screenshot
                setSelectedScreenshot(screenshot);
            } catch (error) {
                console.error('Error processing screenshot:', error);
                message.error('Failed to process screenshot');
            }
        };

        // Remove any existing listeners before adding new one
        api.removeAllListeners('capture-frame');

        // Add new listener
        // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
        api.on('capture-frame', handleCaptureFrame);

        return () => {
            console.log('Removing capture frame listener');
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [message]); // Only re-run if message changes

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

    return (
        <App>
            <ScreenshotContainer>
                <ScreenshotSider>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <ScreenshotSettings onSettingsChange={handleSettingsChange} />
                        <MonitorSelection onDisplaysChange={handleDisplaysChange} />
                        <ControlsPanel>
                            <ScreenshotControls
                                onCapture={handleCapture}
                                isCapturing={isCapturing}
                            />
                        </ControlsPanel>
                    </Space>
                </ScreenshotSider>
                <ScreenshotContent>
                    {screenshots.length > 0 ? (
                        <>
                            <MainPreviewContainer>
                                {selectedScreenshot && (
                                    <ScreenshotCard
                                        key={selectedScreenshot.id}
                                        imageUrl={selectedScreenshot.imageData}
                                        timestamp={selectedScreenshot.timestamp}
                                        isSelected={true}
                                    />
                                )}
                            </MainPreviewContainer>
                            <GameAdviceContainer>
                                {/* Game advice content will go here */}
                                <h2>Game Analysis</h2>
                                <p>AI-powered game advice and suggestions will appear here...</p>
                            </GameAdviceContainer>
                            <TimelineContainer>
                                {screenshots.map(screenshot => (
                                    <TimelineItem
                                        key={screenshot.id}
                                        onClick={() => setSelectedScreenshot(screenshot)}
                                        $isSelected={selectedScreenshot?.id === screenshot.id}
                                    >
                                        <img
                                            src={screenshot.imageData}
                                            alt={`Thumbnail from ${new Date(screenshot.timestamp).toLocaleString()}`}
                                        />
                                        <div className="time">
                                            {new Date(screenshot.timestamp).toLocaleTimeString()}
                                        </div>
                                    </TimelineItem>
                                ))}
                            </TimelineContainer>
                        </>
                    ) : (
                        <NoScreenshotsMessage>
                            <CameraOutlined className="icon" />
                            <div className="message">No screenshots captured yet</div>
                            <div className="subtitle">Select a display and click "Start Capture" to begin</div>
                        </NoScreenshotsMessage>
                    )}
                </ScreenshotContent>
            </ScreenshotContainer>
        </App>
    );
};

export default Screenshot; 