import React, { useCallback } from 'react';
import { Space, Slider } from 'antd';
import styled from 'styled-components';
import type { ScreenshotSettingsProps } from './Screenshot.types';

const SettingsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({ onChange }) => {
    const handleIntervalChange = useCallback((value: number) => {
        onChange({ captureInterval: value * 1000 }); // Convert to milliseconds
    }, [onChange]);

    return (
        <SettingsContainer>
            <Space direction="vertical" size="small">
                <div>
                    <label>Capture Interval (seconds)</label>
                    <div data-testid="interval-slider">
                        <Slider
                            min={1}
                            max={10}
                            defaultValue={1}
                            onChange={handleIntervalChange}
                        />
                    </div>
                </div>
            </Space>
        </SettingsContainer>
    );
}; 