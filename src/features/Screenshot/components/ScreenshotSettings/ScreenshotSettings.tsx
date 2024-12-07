import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Select, Switch, Slider } from 'antd';
import type { ScreenshotConfig } from '@electron/services/screenshot/types';

interface ScreenshotSettingsProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
}

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({ onSettingsChange }) => {
    const [form] = Form.useForm();
    const [config, setConfig] = useState<Partial<ScreenshotConfig>>();

    useEffect(() => {
        // Load initial config
        window.electronAPI?.getConfig().then(initialConfig => {
            const { activeDisplays, ...configWithoutDisplays } = initialConfig;
            setConfig(configWithoutDisplays);
            form.setFieldsValue(configWithoutDisplays);
        });
    }, [form]);

    const handleValuesChange = (_changedValues: unknown, allValues: Partial<ScreenshotConfig>) => {
        onSettingsChange(allValues);
    };

    return (
        <Card title="Screenshot Settings">
            <Form
                form={form}
                layout="vertical"
                onValuesChange={handleValuesChange}
                initialValues={config}
            >
                <Form.Item
                    label="Capture Interval (ms)"
                    name="captureInterval"
                    rules={[{ required: true, min: 1000, message: 'Interval must be at least 1000ms' }]}
                >
                    <InputNumber
                        min={1000}
                        max={60000}
                        step={1000}
                        style={{ width: '100%' }}
                        addonAfter="ms"
                    />
                </Form.Item>

                <Form.Item
                    label="Image Format"
                    name="format"
                    rules={[{ required: true }]}
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
                    rules={[{ required: true, min: 1, max: 100 }]}
                >
                    <Slider
                        min={1}
                        max={100}
                        marks={{
                            1: 'Low',
                            50: 'Medium',
                            100: 'High'
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
                    rules={[{ required: true, min: 0, max: 1 }]}
                >
                    <Slider
                        min={0}
                        max={1}
                        step={0.05}
                        marks={{
                            0: 'Low',
                            0.5: 'Medium',
                            1: 'High'
                        }}
                    />
                </Form.Item>
            </Form>
        </Card>
    );
}; 