import React, { useState, useEffect } from 'react';
import { Space, message } from 'antd';
import { ScreenshotControls, MonitorSelection, ScreenshotSettings } from './components';
import { ScreenshotCard } from './components/ScreenshotCard';
import type { ScreenshotConfig, CaptureFrame, CaptureError } from '@electron/types/electron-api';
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

export const Screenshot: React.FC = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenshots, setScreenshots] = useState<Screenshot[]>([]);

    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        const handleCaptureFrame = (data: CaptureFrame | CaptureError) => {
            console.log('Received capture frame:', data); // Debug log

            if ('buffer' in data && 'metadata' in data) {
                // It's a CaptureFrame
                const frame = data as CaptureFrame;
                console.log('Frame metadata:', frame.metadata); // Debug log
                console.log('Buffer type:', typeof frame.buffer); // Debug log
                console.log('Buffer length:', frame.buffer.length); // Debug log

                try {
                    const base64String = Buffer.from(frame.buffer).toString('base64');
                    const screenshot: Screenshot = {
                        id: `${frame.metadata.timestamp}-${frame.metadata.displayId}`,
                        imageData: `data:image/${frame.metadata.format};base64,${base64String}`,
                        timestamp: frame.metadata.timestamp,
                        displayId: frame.metadata.displayId
                    };

                    console.log('Created screenshot:', screenshot.id); // Debug log
                    setScreenshots(prev => {
                        console.log('Previous screenshots:', prev.length); // Debug log
                        return [screenshot, ...prev].slice(0, 20);
                    });
                } catch (error) {
                    console.error('Error processing screenshot:', error);
                    message.error('Failed to process screenshot');
                }
            } else {
                // It's a CaptureError
                const error = data as CaptureError;
                console.error('Capture error:', error); // Debug log
                message.error(`Screenshot capture failed: ${error.message}`);
            }
        };

        console.log('Setting up capture frame listener'); // Debug log
        api.on('capture-frame', handleCaptureFrame);
        return () => {
            console.log('Cleaning up capture frame listener'); // Debug log
            api.off('capture-frame', handleCaptureFrame);
            if (isCapturing) {
                api.stopCapture().catch(error => {
                    console.error('Failed to stop capture on unmount:', error);
                });
                setIsCapturing(false);
            }
        };
    }, [isCapturing]);

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
            if (isCapturing) {
                await window.electronAPI?.stopCapture();
                setIsCapturing(false);
                message.success('Capture stopped');
            } else {
                await window.electronAPI?.startCapture();
                setIsCapturing(true);
                message.success('Capture started');
            }
        } catch (error) {
            console.error('Failed to capture:', error);
            message.error('Failed to capture screenshot');
            setIsCapturing(false);
        }
    };

    console.log('Rendering with screenshots:', screenshots.length); // Debug log

    return (
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
                    {screenshots.map(screenshot => (
                        <ScreenshotCard
                            key={screenshot.id}
                            imageUrl={screenshot.imageData}
                            timestamp={screenshot.timestamp}
                        />
                    ))}
                </GridContainer>
            </ScreenshotContent>
        </ScreenshotContainer>
    );
};

export default Screenshot; 