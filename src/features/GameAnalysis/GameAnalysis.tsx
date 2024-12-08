import React, { useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { Card } from '../../components/atoms/Card';
import { GameAnalysisContainer, AnalysisContent, LoadingOverlay } from './GameAnalysis.styles';
import { Button, Space } from 'antd';
import { SoundOutlined, AudioMutedOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { toggleMute } from '../../store/slices/aiSlice';
import type { RootState } from '../../store/types';

interface GameAnalysisProps {
    screenshot?: {
        aiResponse?: {
            content: string;
        };
    } | null;
}

export const GameAnalysis: React.FC<GameAnalysisProps> = ({ screenshot }) => {
    const isLoading = useAppSelector((state: RootState) => state.ai.isAnalyzing);
    const isMuted = useAppSelector((state: RootState) => state.ai.isMuted);
    const dispatch = useAppDispatch();
    const spokenContentRef = useRef<string | null>(null);

    const playContent = (content: string) => {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content);
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (!isMuted && screenshot?.aiResponse?.content) {
            // Prevent speaking the same content twice (React Strict Mode protection)
            if (spokenContentRef.current !== screenshot.aiResponse.content) {
                spokenContentRef.current = screenshot.aiResponse.content;
                playContent(screenshot.aiResponse.content);
            }
        }
    }, [screenshot?.aiResponse?.content, isMuted]);

    const handleToggleMute = () => {
        dispatch(toggleMute());
        // Stop any ongoing speech when muting
        if (!isMuted) {
            window.speechSynthesis.cancel();
        }
    };

    const handlePlay = () => {
        if (screenshot?.aiResponse?.content) {
            playContent(screenshot.aiResponse.content);
        }
    };

    if (!screenshot?.aiResponse && !isLoading) {
        return (
            <GameAnalysisContainer>
                <Card>
                    <AnalysisContent style={{ marginTop: 5 }}>
                        Take a screenshot to get AI analysis of your gameplay
                    </AnalysisContent>
                </Card>
            </GameAnalysisContainer>
        );
    }

    return (
        <GameAnalysisContainer>
            <Card>
                <Space style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    {screenshot?.aiResponse?.content && (
                        <Button
                            icon={<PlayCircleOutlined />}
                            onClick={handlePlay}
                            title="Play response"
                        />
                    )}
                    <Button
                        icon={isMuted ? <AudioMutedOutlined /> : <SoundOutlined />}
                        onClick={handleToggleMute}
                        title={isMuted ? "Unmute auto-play" : "Mute auto-play"}
                    />
                </Space>
                {isLoading && <LoadingOverlay>Analyzing screenshot...</LoadingOverlay>}
                <AnalysisContent style={{ marginTop: 5 }}>
                    {screenshot?.aiResponse?.content || 'No analysis available'}
                </AnalysisContent>
            </Card>
        </GameAnalysisContainer>
    );
}; 