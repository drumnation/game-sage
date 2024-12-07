import React, { useEffect, useState, useCallback } from 'react';
import { Select } from 'antd';
import type { MonitorSelectionProps } from '../../Screenshot.types';
import type { DisplayInfo, APIResponse } from '@electron/types/electron-api';

const { Option } = Select;

export const MonitorSelection: React.FC<MonitorSelectionProps> = ({
    onDisplaysChange,
    isCapturing = false
}) => {
    const [displays, setDisplays] = useState<DisplayInfo[]>([]);
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);

    const loadDisplays = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) {
            console.error('Electron API not available');
            return;
        }

        try {
            console.log('Fetching available displays...'); // Debug log
            const response: APIResponse<DisplayInfo[]> = await api.listDisplays();
            console.log('Displays response:', response);

            if (response.success && Array.isArray(response.data)) {
                console.log('Available displays:', response.data); // Debug log
                setDisplays(response.data);

                // Get current config to check active displays
                const configResponse = await api.getConfig();
                const currentActiveDisplays = configResponse.success && configResponse.data?.activeDisplays;

                // If we have active displays in config, use those
                if (currentActiveDisplays && currentActiveDisplays.length > 0) {
                    console.log('Using active displays from config:', currentActiveDisplays);
                    setSelectedDisplays(currentActiveDisplays);
                    onDisplaysChange(currentActiveDisplays);
                } else {
                    // Otherwise select primary display by default
                    const primaryDisplay = response.data.find((d: DisplayInfo) => d.isPrimary);
                    if (primaryDisplay) {
                        console.log('Selecting primary display:', primaryDisplay);
                        const newSelection = [primaryDisplay.id];
                        setSelectedDisplays(newSelection);
                        onDisplaysChange(newSelection);
                    }
                }
            } else {
                console.error('Invalid displays response:', response);
                setDisplays([]);
            }
        } catch (error) {
            console.error('Failed to load displays:', error);
            setDisplays([]);
        }
    }, [onDisplaysChange]);

    useEffect(() => {
        loadDisplays();
    }, [loadDisplays]);

    const handleDisplayChange = (newSelection: string[]) => {
        if (isCapturing) {
            return; // Prevent changes while capturing
        }
        console.log('Display selection changed:', newSelection); // Debug log
        setSelectedDisplays(newSelection);
        onDisplaysChange(newSelection);
    };

    return (
        <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select displays"
            value={selectedDisplays}
            onChange={handleDisplayChange}
            disabled={isCapturing}
        >
            {displays.map(display => (
                <Option key={display.id} value={display.id}>
                    {display.name} {display.isPrimary ? '(Primary)' : ''}
                </Option>
            ))}
        </Select>
    );
}; 