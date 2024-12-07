import React, { useEffect } from 'react';
import { Form, InputNumber, Select, Switch, Slider } from 'antd';
import type { ScreenshotConfig } from '@electron/types/electron-api';

interface ScreenshotSettingsProps {
    onSettingsChange: (settings: Partial<ScreenshotConfig>) => void;
}

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({
    onSettingsChange
}) => {
    const [form] = Form.useForm<ScreenshotConfig>();

    useEffect(() => {
        // Load initial config
        window.electronAPI?.getConfig().then(response => {
            if (response.success && response.data) {
                form.setFieldsValue(response.data);
            }
        });
    }, [form]);

    const handleValuesChange = (_changedValues: Partial<ScreenshotConfig>, allValues: ScreenshotConfig) => {
        onSettingsChange(allValues);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={{
                captureInterval: 1000,
                format: 'jpeg',
                quality: 80,
                detectSceneChanges: false,
                sceneChangeThreshold: 0.1
            }}
        >
            <Form.Item
                label="Capture Interval (ms)"
                name="captureInterval"
                tooltip="Time between captures in milliseconds"
            >
                <InputNumber min={100} max={10000} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
                label="Image Format"
                name="format"
                tooltip="Format to save screenshots in"
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
                tooltip="Higher quality means larger file size"
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
                tooltip="Only process frames when significant changes are detected"
            >
                <Switch />
            </Form.Item>

            <Form.Item noStyle dependencies={['detectSceneChanges']}>
                {({ getFieldValue }) => (
                    <Form.Item
                        label="Scene Change Threshold"
                        name="sceneChangeThreshold"
                        tooltip="Higher values mean more significant changes are needed"
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
                            disabled={!getFieldValue('detectSceneChanges')}
                        />
                    </Form.Item>
                )}
            </Form.Item>
        </Form>
    );
}; 