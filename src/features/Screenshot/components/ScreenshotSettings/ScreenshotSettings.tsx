import React, { useEffect, useCallback } from 'react';
import { Form, InputNumber, Select, Switch, Button, Slider, Modal, Divider } from 'antd';
import { KeyOutlined, RedoOutlined } from '@ant-design/icons';
import type { ScreenshotSettingsProps } from '../../Screenshot.types';
import type { ScreenshotConfig, APIResponse } from '@electron/types';
import { useHotkeyManager } from '../../../../store/hooks/useHotkeyManager';
import { HotkeyInputContainer, HotkeyInput, HotkeyButtonGroup } from './ScreenshotSettings.styles';

interface FormValues extends Omit<ScreenshotConfig, 'activeDisplays'> {
    useHotkey: boolean;
}

type FormChangedValues = Partial<FormValues>;

const DEFAULT_VALUES: Partial<FormValues> = {
    captureInterval: 1000,
    format: 'jpeg',
    quality: 80,
    detectSceneChanges: false,
    sceneChangeThreshold: 0.1,
    useHotkey: false,
    maxConcurrentCaptures: 1
};

const DEFAULT_HOTKEY = 'CommandOrControl+Shift+C';

export const ScreenshotSettings: React.FC<ScreenshotSettingsProps> = ({
    isCapturing,
    onSettingsChange,
    onHotkeyRecordingChange
}) => {
    const [form] = Form.useForm<FormValues>();
    const {
        captureHotkey,
        isRecordingHotkey,
        pressedKeys,
        startRecording,
        stopRecording,
        updateHotkey
    } = useHotkeyManager();

    // Notify parent of recording state changes
    useEffect(() => {
        onHotkeyRecordingChange?.(isRecordingHotkey);
    }, [isRecordingHotkey, onHotkeyRecordingChange]);

    // Load initial config and settings from storage
    useEffect(() => {
        const api = window.electronAPI;
        if (!api) return;

        // Load config
        api.getConfig().then((response: APIResponse<ScreenshotConfig>) => {
            if (response.success && response.data) {
                const config = response.data;
                form.setFieldsValue({
                    ...config,
                    useHotkey: localStorage.getItem('useHotkey') === 'true' // Load from localStorage
                });
                onSettingsChange?.({
                    ...config,
                    useHotkey: localStorage.getItem('useHotkey') === 'true'
                });
            }
        });

        // Load hotkey
        const savedHotkey = localStorage.getItem('captureHotkey');
        if (savedHotkey) {
            updateHotkey(savedHotkey);
        }
    }, [form, onSettingsChange, updateHotkey]);

    const handleValuesChange = useCallback((changedValues: FormChangedValues, allValues: FormValues) => {
        if (isCapturing) return;

        // Handle hotkey mode change
        if ('useHotkey' in changedValues) {
            // Save to localStorage
            localStorage.setItem('useHotkey', String(changedValues.useHotkey));

            // Reset scene detection when switching to hotkey mode
            if (changedValues.useHotkey) {
                form.setFieldsValue({
                    detectSceneChanges: false,
                    sceneChangeThreshold: DEFAULT_VALUES.sceneChangeThreshold
                });
            }
        }

        // Notify parent of changes
        onSettingsChange?.(allValues);
    }, [form, isCapturing, onSettingsChange]);

    const handleResetHotkey = useCallback(() => {
        updateHotkey(DEFAULT_HOTKEY);
        localStorage.setItem('captureHotkey', DEFAULT_HOTKEY);
    }, [updateHotkey]);

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={DEFAULT_VALUES}
            onValuesChange={handleValuesChange}
            disabled={isCapturing}
        >
            <Form.Item
                name="useHotkey"
                label="Capture Mode"
                valuePropName="checked"
            >
                <Switch
                    checkedChildren="Hotkey"
                    unCheckedChildren="Interval"
                />
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.useHotkey !== curr.useHotkey}
            >
                {({ getFieldValue }) => {
                    const useHotkey = getFieldValue('useHotkey');

                    return useHotkey ? (
                        <Form.Item label="Capture Hotkey">
                            <HotkeyInputContainer>
                                <HotkeyInput>
                                    <InputNumber
                                        value={captureHotkey}
                                        readOnly
                                        prefix={<KeyOutlined />}
                                        style={{ width: '100%' }}
                                    />
                                </HotkeyInput>
                                <HotkeyButtonGroup>
                                    <Button
                                        onClick={startRecording}
                                        icon={<KeyOutlined />}
                                        type="primary"
                                    >
                                        Record Hotkey
                                    </Button>
                                    <Button
                                        onClick={handleResetHotkey}
                                        icon={<RedoOutlined />}
                                    >
                                        Reset to Default
                                    </Button>
                                </HotkeyButtonGroup>
                            </HotkeyInputContainer>
                        </Form.Item>
                    ) : (
                        <>
                            <Form.Item
                                name="captureInterval"
                                label="Capture Interval (ms)"
                            >
                                <Slider
                                    min={100}
                                    max={10000}
                                    step={100}
                                    marks={{
                                        100: '100ms',
                                        1000: '1s',
                                        5000: '5s',
                                        10000: '10s'
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="detectSceneChanges"
                                label="Scene Change Detection"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>

                            <Form.Item
                                noStyle
                                shouldUpdate={(prev, curr) => prev.detectSceneChanges !== curr.detectSceneChanges}
                            >
                                {({ getFieldValue }) => {
                                    const detectSceneChanges = getFieldValue('detectSceneChanges');

                                    return detectSceneChanges && (
                                        <Form.Item
                                            name="sceneChangeThreshold"
                                            label="Scene Change Threshold"
                                        >
                                            <Slider
                                                min={0.01}
                                                max={1}
                                                step={0.01}
                                                marks={{
                                                    0.01: 'Low',
                                                    0.1: 'Med',
                                                    0.5: 'High'
                                                }}
                                            />
                                        </Form.Item>
                                    );
                                }}
                            </Form.Item>
                        </>
                    );
                }}
            </Form.Item>

            <Divider />

            <Form.Item name="format" label="Image Format">
                <Select>
                    <Select.Option value="jpeg">JPEG</Select.Option>
                    <Select.Option value="png">PNG</Select.Option>
                </Select>
            </Form.Item>

            <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.format !== curr.format}
            >
                {({ getFieldValue }) => {
                    const format = getFieldValue('format');

                    return format === 'jpeg' && (
                        <Form.Item name="quality" label="JPEG Quality">
                            <Slider
                                min={0.1}
                                max={1}
                                step={0.1}
                                marks={{
                                    0.1: 'Low',
                                    0.5: 'Med',
                                    1: 'High'
                                }}
                            />
                        </Form.Item>
                    );
                }}
            </Form.Item>

            <Modal
                open={isRecordingHotkey}
                onCancel={stopRecording}
                footer={null}
                closable={false}
                maskClosable={false}
                keyboard={false}
                destroyOnClose
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3>Press your desired hotkey combination</h3>
                    <p>{pressedKeys.join(' + ') || 'Waiting for input...'}</p>
                    <p style={{ color: '#888' }}>Press Esc to cancel</p>
                </div>
            </Modal>
        </Form>
    );
}; 