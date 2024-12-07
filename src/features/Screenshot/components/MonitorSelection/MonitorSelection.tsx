import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import type { MonitorSelectionProps } from '../../Screenshot.types';
import type { DisplayInfo } from '@electron/types/electron-api';

const { Option } = Select;

export const MonitorSelection: React.FC<MonitorSelectionProps> = ({ onDisplaysChange }) => {
    const [displays, setDisplays] = useState<DisplayInfo[]>([]);
    const [selectedDisplays, setSelectedDisplays] = useState<string[]>([]);

    useEffect(() => {
        window.electronAPI?.listDisplays().then(displayInfo => {
            setDisplays(displayInfo);
            // Select primary display by default
            const primaryDisplay = displayInfo.find(d => d.isPrimary);
            if (primaryDisplay) {
                const newSelection = [primaryDisplay.id];
                setSelectedDisplays(newSelection);
                onDisplaysChange(newSelection);
            }
        });
    }, [onDisplaysChange]);

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