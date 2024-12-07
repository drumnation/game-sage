import React, { useState } from 'react';
import { Space } from 'antd';
import { ScreenshotControls, MonitorSelection, ScreenshotSettings } from './components';
import type { ScreenshotConfig } from '@electron/types/electron-api';
import {
    ScreenshotContainer,
    ScreenshotSider,
    ScreenshotContent,
    GridContainer,
    SettingsPanel,
    ControlsPanel
} from './Screenshot.styles';

export const Screenshot: React.FC = () => {
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleDisplaysChange = (displays: string[]) => {
        setSelectedDisplays(displays);
        window.electronAPI?.updateConfig({ activeDisplays: displays });
    };

    const handleSettingsChange = async (settings: Partial<ScreenshotConfig>) => {
        try {
            await window.electronAPI?.updateConfig(settings);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    const handleCapture = async () => {
        if (selectedDisplays.length === 0) {
            console.error('No displays selected');
            return;
        }

        try {
            setIsCapturing(true);
            await window.electronAPI?.captureNow();
        } catch (error) {
            console.error('Failed to capture:', error);
        } finally {
            setIsCapturing(false);
        }
    };

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
                    {/* Screenshot grid content will go here */}
                </GridContainer>
            </ScreenshotContent>
        </ScreenshotContainer>
    );
};

export default Screenshot; 