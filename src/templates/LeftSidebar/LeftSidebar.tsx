import React from 'react';
import { Tabs } from 'antd';
import { Screenshot } from '../../features/Screenshot';
import { AISettings } from '../../features/AI/components/AISettings';
import type { ScreenshotConfig } from '@electron/types';
import { useLeftSidebar } from './LeftSidebar.hook';
import { LeftSidebarContainer } from './LeftSidebar.styles';

interface LeftSidebarProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
    onDisplaysChange: (selectedDisplays: string[]) => void;
    onCapture: () => void;
    onSingleCapture: () => void;
    isCapturing: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    onSettingsChange,
    onDisplaysChange,
    onCapture,
    onSingleCapture,
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
                    onSingleCapture={onSingleCapture}
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