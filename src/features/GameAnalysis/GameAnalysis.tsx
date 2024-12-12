import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { Card } from '../../components/atoms/Card';
import { GameAnalysisContainer, AnalysisContent, LoadingOverlay, MemoryList } from './GameAnalysis.styles';
import { Button, Space, Collapse, Typography, theme, Spin } from 'antd';
import { SoundOutlined, AudioMutedOutlined, PlayCircleOutlined, InfoCircleOutlined, HistoryOutlined, PauseCircleOutlined, RedoOutlined } from '@ant-design/icons';
import { toggleMute } from '../../store/slices/aiSlice';
import type { RootState } from '../../store/types';
import type { AIMemoryEntry } from '@electron/types';

const { Text } = Typography;

interface GameAnalysisProps {
    screenshot?: {
        aiResponse?: {
            content: string;
            summary: string;
        };
        aiMemory?: AIMemoryEntry[];
    } | null;
}

const filterJsonContent = (text: string): string => {
    if (!text) return '';

    // Remove any markdown code block syntax
    const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();

    // If the text looks like it might be JSON
    if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
        try {
            const parsed = JSON.parse(cleanText);
            if (parsed.content) {
                return parsed.content;
            }
        } catch (e) {
            // If it's an incomplete JSON string, try to extract content directly
            const contentMatch = cleanText.match(/"content":\s*"([^"]*)"/) ||
                cleanText.match(/"content":\s*'([^']*)'/) ||
                cleanText.match(/content":\s*"([^"]*)$/);
            if (contentMatch && contentMatch[1]) {
                return contentMatch[1];
            }
            console.log('Failed to parse JSON content:', e);
        }
    }

    return cleanText || text;
};

export const GameAnalysis: React.FC<GameAnalysisProps> = ({ screenshot }) => {
    const isLoading = useAppSelector((state: RootState) => state.ai.isAnalyzing);
    const isMuted = useAppSelector((state: RootState) => state.ai.isMuted);
    const dispatch = useAppDispatch();
    const spokenContentRef = useRef<string | null>(null);
    const lastValidContentRef = useRef<typeof screenshot>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { token } = theme.useToken();

    // Update lastValidContent when we get new non-loading content
    useEffect(() => {
        if (!isLoading && screenshot?.aiResponse) {
            lastValidContentRef.current = screenshot;
        }
    }, [isLoading, screenshot]);

    const playContent = (content: string) => {
        console.log('[Speech] Attempting to play content:', { contentLength: content.length, isMuted });

        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();

        // Filter and clean the content
        const cleanContent = filterJsonContent(content);
        console.log('[Speech] Cleaned content:', { cleanContentLength: cleanContent.length });

        // Create and configure utterance
        const utterance = new SpeechSynthesisUtterance(cleanContent);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Add event handlers for debugging and state management
        utterance.onstart = () => {
            console.log('[Speech] Started speaking');
            setIsPlaying(true);
        };
        utterance.onend = () => {
            console.log('[Speech] Finished speaking');
            setIsPlaying(false);
        };
        utterance.onerror = (event) => {
            console.error('[Speech] Error:', event);
            setIsPlaying(false);
        };

        // Speak the content
        console.log('[Speech] Calling speechSynthesis.speak()');
        window.speechSynthesis.speak(utterance);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                setIsPlaying(true);
            } else if (screenshot?.aiResponse?.content) {
                playContent(screenshot.aiResponse.content);
            }
        }
    };

    const handleRestart = () => {
        if (screenshot?.aiResponse?.content) {
            window.speechSynthesis.cancel();
            playContent(screenshot.aiResponse.content);
        }
    };

    useEffect(() => {
        console.log('[Speech] Content or mute state changed:', {
            hasContent: !!screenshot?.aiResponse?.content,
            isMuted,
            contentLength: screenshot?.aiResponse?.content?.length
        });

        if (!isMuted && screenshot?.aiResponse?.content) {
            // Prevent speaking the same content twice
            if (spokenContentRef.current !== screenshot.aiResponse.content) {
                console.log('[Speech] New content detected, playing...');
                spokenContentRef.current = screenshot.aiResponse.content;
                playContent(screenshot.aiResponse.content);
            } else {
                console.log('[Speech] Content already spoken, skipping');
            }
        } else {
            // Cancel speech if muted
            console.log('[Speech] Cancelling speech (muted or no content)');
            window.speechSynthesis.cancel();
        }

        // Cleanup on unmount or content change
        return () => {
            console.log('[Speech] Cleanup - cancelling speech');
            window.speechSynthesis.cancel();
        };
    }, [screenshot?.aiResponse?.content, isMuted]);

    const handleToggleMute = () => {
        console.log('[Speech] Toggling mute:', { currentlyMuted: isMuted });
        dispatch(toggleMute());

        // Stop any ongoing speech when muting
        if (!isMuted) {
            console.log('[Speech] Muting - cancelling speech');
            window.speechSynthesis.cancel();
        } else {
            // Resume speaking when unmuting if there's content
            if (screenshot?.aiResponse?.content) {
                console.log('[Speech] Unmuting - resuming speech');
                playContent(screenshot.aiResponse.content);
            }
        }
    };

    const renderContent = () => {
        // Use the most recent valid content (either current or last valid)
        const contentToShow = isLoading ? lastValidContentRef.current : screenshot;

        if (!contentToShow?.aiResponse && !isLoading) {
            return (
                <AnalysisContent $isEmpty>
                    No AI analysis available
                </AnalysisContent>
            );
        }

        const content = contentToShow?.aiResponse?.content
            ? filterJsonContent(contentToShow.aiResponse.content)
            : 'No analysis available';

        const collapseItems = [
            {
                key: 'summary',
                label: (
                    <Space>
                        <InfoCircleOutlined />
                        Summary
                    </Space>
                ),
                children: contentToShow?.aiResponse?.summary || 'No summary available'
            },
            {
                key: 'memory',
                label: (
                    <Space>
                        <HistoryOutlined />
                        Recent Observations
                    </Space>
                ),
                children: contentToShow?.aiMemory && contentToShow.aiMemory.length > 0 ? (
                    <MemoryList>
                        {contentToShow.aiMemory.map((entry) => (
                            <li key={entry.timestamp}>
                                <Text type="secondary" style={{ fontSize: '0.9em' }}>
                                    {new Date(entry.timestamp).toLocaleTimeString()}: {filterJsonContent(entry.summary)}
                                </Text>
                            </li>
                        ))}
                    </MemoryList>
                ) : 'No recent observations'
            }
        ];

        return (
            <AnalysisContent>
                {isLoading && (
                    <LoadingOverlay>
                        <Space direction="vertical" align="center">
                            <Spin size="large" />
                            <div>Analyzing screenshot...</div>
                        </Space>
                    </LoadingOverlay>
                )}
                <Text>{content}</Text>

                <Collapse
                    items={collapseItems}
                    style={{
                        marginTop: 24,
                        background: token.colorBgContainer,
                        borderColor: token.colorBorder
                    }}
                    ghost={false}
                    collapsible={isLoading ? "disabled" : undefined}
                />
            </AnalysisContent>
        );
    };

    return (
        <GameAnalysisContainer>
            <Card>
                {screenshot?.aiResponse?.content && !isLoading && (
                    <Space
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            zIndex: 2
                        }}
                    >
                        <Button
                            type="text"
                            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={handlePlayPause}
                            title={isPlaying ? "Pause response" : "Play response"}
                        />
                        <Button
                            type="text"
                            icon={<RedoOutlined />}
                            onClick={handleRestart}
                            title="Restart from beginning"
                        />
                        <Button
                            type="text"
                            icon={isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                            onClick={handleToggleMute}
                            title={isMuted ? "Unmute auto-play" : "Mute auto-play"}
                        />
                    </Space>
                )}
                <div style={{ position: 'relative', minHeight: '200px' }}>
                    {renderContent()}
                </div>
            </Card>
        </GameAnalysisContainer>
    );
}; 