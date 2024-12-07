import React, { useState, useCallback } from 'react';
import { CameraOutlined, SettingOutlined } from '@ant-design/icons';
import type { TabsProps } from 'antd';
import type { TabKey, TabConfig } from './LeftSidebar.types';

const createTabConfig = (key: TabKey, label: string, icon: React.ReactNode): TabConfig => ({
    key,
    label,
    icon,
});

const TAB_CONFIGS: TabConfig[] = [
    createTabConfig('screenshot', 'Screenshot', <CameraOutlined />),
    createTabConfig('ai', 'AI Settings', <SettingOutlined />),
];

export const useLeftSidebar = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('screenshot');

    const handleTabChange = useCallback((key: string) => {
        setActiveTab(key as TabKey);
    }, []);

    const tabItems: TabsProps['items'] = TAB_CONFIGS.map(config => ({
        key: config.key,
        label: (
            <span>
                {config.icon}
                <span style={{ marginLeft: 8 }}>{config.label}</span>
            </span>
        ),
    }));

    return {
        activeTab,
        tabItems,
        handleTabChange,
    } as const;
}; 