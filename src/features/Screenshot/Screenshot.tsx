import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Space, App, Button } from 'antd';
import { CameraOutlined, StepBackwardOutlined, StepForwardOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Slider } from '@mui/material';
import { ScreenshotControls, MonitorSelection, ScreenshotSettings } from './components';
import { ScreenshotCard } from './components/ScreenshotCard';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import {
    ScreenshotContainer,
    ScreenshotSider,
    ScreenshotContent,
    MainPreviewContainer,
    TimelineContainer,
    TimelineControls,
    NoScreenshotsMessage,
    ControlsPanel,
    GameAdviceContainer
} from './Screenshot.styles';

interface Screenshot {
    id: string;
    imageData: string;
    timestamp: number;
    displayId: string;
    isSceneChange?: boolean;
    previousSceneScore?: number;
}

interface CaptureFrameData {
    imageData: string;
    metadata: {
        timestamp: number;
        displayId: string;
        format: string;
        width: number;
        height: number;
        isSceneChange: boolean;
        previousSceneScore: number;
    };
}

export const Screenshot: React.FC = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
    const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { message } = App.useApp();
    const screenshotCounter = useRef(0);
    const playbackInterval = useRef<NodeJS.Timeout>();

    // Effect to sync capture state on mount
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        // Stop any existing capture and reset state
        api.stopCapture()
            .then(() => {
                console.log('Stopped any existing capture on mount');
                setIsCapturing(false);
            })
            .catch(error => {
                console.error('Failed to stop capture on mount:', error);
            });

        // Remove any existing listeners
        api.removeAllListeners('capture-frame');
    }, []); // Only run on mount

    // Effect to handle cleanup on unmount
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        return () => {
            // Clear any playback interval
            if (playbackInterval.current) {
                clearInterval(playbackInterval.current);
            }

            // Stop capturing if we're still capturing
            if (isCapturing) {
                api.stopCapture()
                    .then(() => {
                        console.log('Successfully stopped capture on cleanup');
                        setIsCapturing(false);
                    })
                    .catch(error => {
                        console.error('Failed to stop capture on cleanup:', error);
                    });
            }

            // Remove all capture frame listeners
            api.removeAllListeners('capture-frame');
        };
    }, [isCapturing]);

    // Effect to handle capture frame events
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        console.log('Setting up capture frame listener, isCapturing:', isCapturing);

        const handleCaptureFrame = (data: CaptureFrameData) => {
            if (!isCapturing) {
                console.log('Received frame but not capturing, ignoring');
                return;
            }

            console.log('Received capture frame', {
                isSceneChange: data.metadata.isSceneChange,
                changeScore: data.metadata.previousSceneScore ?
                    `${Math.round(data.metadata.previousSceneScore * 100)}%` :
                    'N/A (first frame)'
            });

            try {
                const screenshot: Screenshot = {
                    id: `${data.metadata.timestamp}-${data.metadata.displayId}-${screenshotCounter.current++}`,
                    imageData: `data:image/jpeg;base64,${data.imageData}`,
                    timestamp: data.metadata.timestamp,
                    displayId: data.metadata.displayId,
                    isSceneChange: data.metadata.isSceneChange,
                    previousSceneScore: data.metadata.previousSceneScore
                };

                setScreenshots(prev => {
                    const newScreenshots = [screenshot, ...prev].slice(0, 10);
                    return newScreenshots;
                });

                setSelectedScreenshot(screenshot);
                setCurrentIndex(0);

                if (data.metadata.isSceneChange) {
                    message.info('Scene change detected!');
                }
            } catch (error) {
                console.error('Error processing screenshot:', error);
                message.error('Failed to process screenshot');
            }
        };

        // Remove any existing listeners before adding new one
        api.removeAllListeners('capture-frame');

        // Only add the listener if we're capturing
        if (isCapturing) {
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.on('capture-frame', handleCaptureFrame);
        }

        return () => {
            // @ts-expect-error - Type mismatch between Electron IPC event data and our CaptureFrameData type
            api.off('capture-frame', handleCaptureFrame);
        };
    }, [isCapturing, message]);

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

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handlePrevious = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex(prev => Math.min(screenshots.length - 1, prev + 1));
    };

    // Effect for auto-playback
    useEffect(() => {
        if (isPlaying && screenshots.length > 0) {
            playbackInterval.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= screenshots.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

            return () => {
                if (playbackInterval.current) {
                    clearInterval(playbackInterval.current);
                }
            };
        }
    }, [isPlaying, screenshots.length]);

    const handleSliderChange = useCallback((_event: Event, value: number | number[]) => {
        const newValue = typeof value === 'number' ? value : value[0];
        const newIndex = Math.min(
            screenshots.length - 1,
            Math.max(0, Math.floor((newValue / 100) * screenshots.length))
        );
        setCurrentIndex(newIndex);
    }, [screenshots.length]);

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
                                        isSceneChange={selectedScreenshot.isSceneChange}
                                        sceneChangeScore={selectedScreenshot.previousSceneScore}
                                    />
                                )}
                            </MainPreviewContainer>
                            <TimelineContainer>
                                <TimelineControls>
                                    <div className="timestamp">
                                        {selectedScreenshot && new Date(selectedScreenshot.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="controls">
                                        <Button
                                            icon={<StepBackwardOutlined />}
                                            onClick={handlePrevious}
                                            disabled={currentIndex === 0}
                                        />
                                        <Button
                                            icon={isPlaying ? <PauseOutlined /> : <CaretRightOutlined />}
                                            onClick={handlePlayPause}
                                            disabled={screenshots.length <= 1}
                                        />
                                        <Button
                                            icon={<StepForwardOutlined />}
                                            onClick={handleNext}
                                            disabled={currentIndex === screenshots.length - 1}
                                        />
                                    </div>
                                </TimelineControls>
                                <Slider
                                    value={(currentIndex / Math.max(1, screenshots.length - 1)) * 100}
                                    onChange={handleSliderChange}
                                    aria-label="Screenshot timeline"
                                    sx={{
                                        '& .MuiSlider-thumb': {
                                            width: 12,
                                            height: 12,
                                            transition: '0.2s',
                                            '&:hover': {
                                                width: 14,
                                                height: 14,
                                                boxShadow: '0 0 0 8px rgba(24, 144, 255, 0.16)'
                                            }
                                        },
                                        '& .MuiSlider-rail': {
                                            opacity: 0.32
                                        },
                                        '& .MuiSlider-track': {
                                            border: 'none',
                                            backgroundColor: '#1890ff'
                                        }
                                    }}
                                />
                            </TimelineContainer>
                            <GameAdviceContainer>
                                <h2>Game Analysis</h2>
                                <p>AI-powered game advice and suggestions will appear here based on the current screenshot.</p>
                                {/* AI analysis content will go here */}
                            </GameAdviceContainer>
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