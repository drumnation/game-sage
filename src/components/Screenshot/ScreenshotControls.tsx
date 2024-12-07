import React, { useCallback } from 'react';
import { Slider, Switch } from 'antd';
import styled from 'styled-components';
import type { ScreenshotControlsProps } from './Screenshot.types';

const ControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

export const ScreenshotControls: React.FC<ScreenshotControlsProps> = ({
    isCapturing,
    config,
    onConfigChange,
}) => {
    const handleIntervalChange = useCallback((value: number) => {
        onConfigChange({ captureInterval: value * 1000 }); // Convert to milliseconds
    }, [onConfigChange]);

    const handleQualityChange = useCallback((value: number) => {
        onConfigChange({ quality: value });
    }, [onConfigChange]);

    const handleSceneDetectionChange = useCallback((checked: boolean) => {
        onConfigChange({ detectSceneChanges: checked });
    }, [onConfigChange]);

    const handleThresholdChange = useCallback((value: number) => {
        onConfigChange({ sceneChangeThreshold: value / 100 }); // Convert to decimal
    }, [onConfigChange]);

    return (
        <ControlsContainer>
            <div>
                <label>Capture Interval (seconds)</label>
                <Slider
                    min={1}
                    max={10}
                    value={Math.floor((config.captureInterval ?? 1000) / 1000)}
                    onChange={handleIntervalChange}
                    disabled={isCapturing}
                />
            </div>
            <div>
                <label>Image Quality</label>
                <Slider
                    min={1}
                    max={100}
                    value={config.quality ?? 90}
                    onChange={handleQualityChange}
                />
            </div>
            <div>
                <label>Scene Change Detection</label>
                <Switch
                    checked={config.detectSceneChanges ?? false}
                    onChange={handleSceneDetectionChange}
                />
            </div>
            {config.detectSceneChanges && (
                <div>
                    <label>Scene Change Threshold (%)</label>
                    <Slider
                        min={1}
                        max={100}
                        value={(config.sceneChangeThreshold ?? 0.1) * 100}
                        onChange={handleThresholdChange}
                    />
                </div>
            )}
        </ControlsContainer>
    );
}; 