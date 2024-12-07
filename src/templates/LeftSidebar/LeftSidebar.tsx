import React from 'react';
import { Tabs } from 'antd';
import { Screenshot } from '../../features/Screenshot';
import { AISettings } from '../../features/AI/components/AISettings';
import type { ScreenshotConfig } from '../../../electron/types/electron-api';
import { useLeftSidebar } from './LeftSidebar.hook';
import { LeftSidebarContainer } from './LeftSidebar.styles';

interface LeftSidebarProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    onDisplaysChange: (displays: string[]) => void;
    onCapture: () => void;
    isCapturing: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    onSettingsChange,
    onDisplaysChange,
    onCapture,
    isCapturing,
}) => {
    const { activeTab, tabItems, handleTabChange } = useLeftSidebar();

    const items = [
        {
            key: 'screenshot',
            label: tabItems.find(item => item.key === 'screenshot')?.label,
            children: (
                <Screenshot
                    onSettingsChange={onSettingsChange}
                    onDisplaysChange={onDisplaysChange}
                    onCapture={onCapture}
                    isCapturing={isCapturing}
                />
            ),
        },
        {
            key: 'ai',
            label: tabItems.find(item => item.key === 'ai')?.label,
            children: <AISettings />,
        },
    ];

    return (
        <LeftSidebarContainer>
            <Tabs
                activeKey={activeTab}
                items={items}
                onChange={handleTabChange}
            />
        </LeftSidebarContainer>
    );
}; 