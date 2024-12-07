import React, { useEffect, ChangeEvent } from 'react';
import { Form, Input, Button, Space, List } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
    updateSettings,
    updateGameInfo,
    addCustomInstruction,
    removeCustomInstruction,
} from '../../../../store/slices/aiSlice';
import type { AISettings as AISettingsType } from '../../../../services/ai/types';
import { SettingsContainer, InstructionInput } from './AISettings.styles';

export const AISettings: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.ai.settings);
    const [newInstruction, setNewInstruction] = React.useState('');

    useEffect(() => {
        form.setFieldsValue({
            apiKey: settings.apiKey,
            gameName: settings.gameInfo.name,
            gameIdentifier: settings.gameInfo.identifier,
        });
    }, [form, settings]);

    const handleSettingsChange = (changedValues: Partial<AISettingsType>) => {
        dispatch(updateSettings(changedValues));
    };

    const handleGameInfoChange = (values: { gameName?: string; gameIdentifier?: string }) => {
        if (values.gameName || values.gameIdentifier) {
            dispatch(updateGameInfo({
                name: values.gameName || settings.gameInfo.name,
                identifier: values.gameIdentifier || settings.gameInfo.identifier,
            }));
        }
    };

    const handleAddInstruction = () => {
        if (newInstruction.trim()) {
            dispatch(addCustomInstruction(newInstruction.trim()));
            setNewInstruction('');
        }
    };

    const handleInstructionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewInstruction(e.target.value);
    };

    const handleRemoveInstruction = (index: number) => {
        dispatch(removeCustomInstruction(index));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddInstruction();
        }
    };

    return (
        <SettingsContainer>
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(_, allValues) => {
                    handleSettingsChange({
                        apiKey: allValues.apiKey,
                    });
                    handleGameInfoChange({
                        gameName: allValues.gameName,
                        gameIdentifier: allValues.gameIdentifier,
                    });
                }}
            >
                <Form.Item
                    label="OpenAI API Key"
                    name="apiKey"
                    rules={[{ required: true, message: 'Please enter your OpenAI API key' }]}
                    tooltip="Your OpenAI API key is required for AI analysis"
                    extra="Your API key is stored locally and never shared"
                >
                    <Input.Password placeholder="sk-..." />
                </Form.Item>

                <Form.Item
                    label="Game Name"
                    name="gameName"
                    rules={[{ required: true, message: 'Please enter the game name' }]}
                    tooltip="The full name of the game you're playing"
                >
                    <Input placeholder="e.g., League of Legends" />
                </Form.Item>

                <Form.Item
                    label="Game Identifier"
                    name="gameIdentifier"
                    rules={[{ required: true, message: 'Please enter the game identifier' }]}
                    tooltip="A short identifier for the game (e.g., 'lol', 'dota2')"
                >
                    <Input placeholder="e.g., lol" />
                </Form.Item>
            </Form>

            <div>
                <h4>Custom Instructions</h4>
                <p className="instruction-help">
                    Add custom instructions to help the AI better understand your game and preferences.
                </p>
                <Space.Compact style={{ width: '100%', marginBottom: '16px' }}>
                    <InstructionInput
                        value={newInstruction}
                        onChange={handleInstructionChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a custom instruction..."
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddInstruction}
                    >
                        Add
                    </Button>
                </Space.Compact>

                <List
                    size="small"
                    bordered
                    dataSource={settings.customInstructions}
                    locale={{ emptyText: 'No custom instructions added yet' }}
                    renderItem={(item, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveInstruction(index)}
                                    aria-label="Remove instruction"
                                />
                            ]}
                        >
                            {item}
                        </List.Item>
                    )}
                />
            </div>
        </SettingsContainer>
    );
}; 