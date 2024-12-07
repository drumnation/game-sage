import React, { useEffect, useState, useCallback } from 'react';
import { Select } from 'antd';
import type { MonitorSelectionProps } from '../../Screenshot.types';
import type { DisplayInfo, APIResponse } from '@electron/types/electron-api';

const { Option } = Select;

export const MonitorSelection: React.FC<MonitorSelectionProps> = ({ onDisplaysChange }) => {
    const [displays, setDisplays] = useState<DisplayInfo[]>([]);
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);

    const loadDisplays = useCallback(async () => {
        const api = window.electronAPI;
        if (!api) return;

        try {
            const response: APIResponse<DisplayInfo[]> = await api.listDisplays();
            console.log('Displays response:', response); // Debug log

            if (response.success && Array.isArray(response.data)) {
                setDisplays(response.data);

                // Select primary display by default only if no display is currently selected
                if (selectedDisplays.length === 0) {
                    const primaryDisplay = response.data.find((d: DisplayInfo) => d.isPrimary);
                    if (primaryDisplay) {
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
    }, [selectedDisplays.length, onDisplaysChange]);

    useEffect(() => {
        loadDisplays();
    }, []); // Remove dependency on onDisplaysChange

    const handleDisplayChange = (newSelection: string[]) => {
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
        >
            {displays.map(display => (
                <Option key={display.id} value={display.id}>
                    {display.name} {display.isPrimary ? '(Primary)' : ''}
                </Option>
            ))}
        </Select>
    );
}; 