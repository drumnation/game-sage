import React, { useEffect, ChangeEvent } from 'react';
import { Form, Input, Button, Space, List, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../../store/store';
import {
    updateSettings,
    updateGameInfo,
    addCustomInstruction,
    removeCustomInstruction,
    updateCustomInstruction,
    setMode,
} from '../../../../store/slices/aiSlice';
import type { AISettings as AISettingsType } from '../../../../services/ai/types';
import type { GameMode } from '../../../../services/ai/types';
import { SettingsContainer, InstructionInput } from './AISettings.styles';

const { TextArea } = Input;

const MODE_DESCRIPTIONS: Record<GameMode, string> = {
    tactical: `Expert gaming advisor focusing on tactical analysis, providing strategic advice, identifying opportunities and threats, and recommending optimal actions.`,
    commentary: `Professional game commentator providing engaging play-by-play analysis, highlighting interesting plays, and keeping commentary natural and entertaining.`,
    esports: `High-energy esports caster bringing excitement to every moment, emphasizing clutch plays and dramatic moments with esports-style commentary.`
};

export const AISettings: React.FC = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.ai.settings);
    const [newInstruction, setNewInstruction] = React.useState('');
    const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
    const [editingText, setEditingText] = React.useState('');

    useEffect(() => {
        form.setFieldsValue({
            apiKey: settings.apiKey,
            gameName: settings.gameInfo?.name || '',
            gameIdentifier: settings.gameInfo?.identifier || '',
        });

        // Set default mode to tactical if not set
        if (!settings.mode) {
            dispatch(setMode('tactical'));
        }
    }, [form, settings, dispatch]);

    const handleModeChange = (mode: GameMode) => {
        dispatch(setMode(mode));
    };

    const handleSettingsChange = (changedValues: Partial<AISettingsType>) => {
        dispatch(updateSettings(changedValues));
    };

    const handleGameInfoChange = (values: { gameName?: string; gameIdentifier?: string }) => {
        if (values.gameName || values.gameIdentifier) {
            dispatch(updateGameInfo({
                name: values.gameName || settings.gameInfo?.name || '',
                identifier: values.gameIdentifier || settings.gameInfo?.identifier || '',
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

    const handleStartEdit = (index: number, text: string) => {
        setEditingIndex(index);
        setEditingText(text);
    };

    const handleSaveEdit = (index: number) => {
        if (editingText.trim()) {
            dispatch(updateCustomInstruction({ index, instruction: editingText.trim() }));
            setEditingIndex(null);
            setEditingText('');
        }
    };

    const handleEditChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setEditingText(e.target.value);
    };

    const handleEditKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
        if (e.key === 'Enter' && e.metaKey) {
            e.preventDefault();
            handleSaveEdit(index);
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
                    label="AI Mode"
                    tooltip="Select how the AI should analyze and respond to your gameplay"
                >
                    <div>
                        <Select
                            value={settings.mode || 'tactical'}
                            onChange={handleModeChange}
                            style={{ width: '100%' }}
                            options={Object.entries(MODE_DESCRIPTIONS).map(([mode]) => ({
                                value: mode,
                                label: mode.charAt(0).toUpperCase() + mode.slice(1)
                            }))}
                        />
                        <div style={{
                            fontSize: '13px',
                            opacity: 0.8,
                            marginTop: '8px',
                            color: 'inherit',
                            lineHeight: '1.5'
                        }}>
                            {MODE_DESCRIPTIONS[settings.mode || 'tactical']}
                        </div>
                    </div>
                </Form.Item>

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
                    dataSource={settings.customInstructions}
                    renderItem={(item: string, index: number) => (
                        <List.Item
                            actions={[
                                editingIndex === index ? (
                                    <Button
                                        key="save"
                                        type="text"
                                        icon={<CheckOutlined />}
                                        onClick={() => handleSaveEdit(index)}
                                    />
                                ) : (
                                    <Button
                                        key="edit"
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => handleStartEdit(index, item)}
                                    />
                                ),
                                <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveInstruction(index)}
                                />
                            ]}
                        >
                            {editingIndex === index ? (
                                <TextArea
                                    value={editingText}
                                    onChange={handleEditChange}
                                    onKeyDown={(e) => handleEditKeyPress(e, index)}
                                    autoFocus
                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                    style={{ minHeight: '60px', width: '100%', fontSize: '14px' }}
                                />
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap', width: '100%', fontSize: '14px' }}>{item}</div>
                            )}
                        </List.Item>
                    )}
                />
            </div>
        </SettingsContainer>
    );
}; 