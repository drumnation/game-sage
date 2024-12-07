import type { ScreenshotConfig } from '@electron/types/electron-api';
import { Form, InputNumber, Select, Slider, Switch, Typography } from 'antd';
import React, { useCallback, useEffect } from 'react';

const { Title } = Typography;

interface ScreenshotSettingsProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
}

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({ onSettingsChange }) => {
    const [form] = Form.useForm<Partial<ScreenshotConfig>>();

    // Load initial config
    useEffect(() => {
        const loadConfig = async () => {
            const api = window.electronAPI;
            if (!api) return;

            try {
                const response = await api.getConfig();
                if (response.success && response.data) {
                    form.setFieldsValue(response.data);
                }
            } catch (error) {
                console.error('Failed to load config:', error);
            }
        };

        loadConfig();
    }, [form]);

    // Debounce settings changes
    const debouncedSettingsChange = useCallback(
        (values: Partial<ScreenshotConfig>) => {
            onSettingsChange(values);
        },
        [onSettingsChange]
    );

    const handleValuesChange = (_: unknown, allValues: Partial<ScreenshotConfig>) => {
        debouncedSettingsChange(allValues);
    };

    return (
        <div>
            <Title level={4}>Screenshot Settings</Title>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={{
                    captureInterval: 1000,
                    format: 'jpeg',
                    quality: 0.8,
                    detectSceneChanges: false,
                    sceneChangeThreshold: 0.1
                }}
            >
                <Form.Item
                    label="Capture Interval (ms)"
                    name="captureInterval"
                    required
                    tooltip="Time between captures in milliseconds"
                >
                    <InputNumber
                        min={100}
                        max={10000}
                        step={100}
                        style={{ width: '100%' }}
                        addonAfter="ms"
                    />
                </Form.Item>

                <Form.Item
                    label="Image Format"
                    name="format"
                    required
                    tooltip="Output image format"
                >
                    <Select>
                        <Select.Option value="jpeg">JPEG</Select.Option>
                        <Select.Option value="png">PNG</Select.Option>
                        <Select.Option value="webp">WebP</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Image Quality"
                    name="quality"
                    required
                    tooltip="Higher quality means larger file size"
                >
                    <Slider
                        min={0.1}
                        max={1}
                        step={0.1}
                        marks={{
                            0.1: 'Low',
                            0.5: 'Medium',
                            1: 'High'
                        }}
                    />
                </Form.Item>

                <Form.Item
                    label="Scene Change Detection"
                    name="detectSceneChanges"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>

                <Form.Item
                    label="Scene Change Threshold"
                    name="sceneChangeThreshold"
                    tooltip="Lower threshold means more sensitive detection"
                    dependencies={['detectSceneChanges']}
                >
                    <Slider
                        min={0.1}
                        max={1}
                        step={0.1}
                        disabled={!form.getFieldValue('detectSceneChanges')}
                        marks={{
                            0.1: 'Low',
                            0.5: 'Medium',
                            1: 'High'
                        }}
                    />
                </Form.Item>
            </Form>
        </div>
    );
}; 