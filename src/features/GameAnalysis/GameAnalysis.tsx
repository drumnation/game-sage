import React from 'react';
import { useAppSelector } from '../../store';
import { Card } from '../../components/atoms/Card';
import { GameAnalysisContainer, AnalysisContent, LoadingOverlay } from './GameAnalysis.styles';
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

    if (!screenshot?.aiResponse && !isLoading) {
        return (
            <GameAnalysisContainer>
                <Card>
                    <AnalysisContent>
                        Take a screenshot to get AI analysis of your gameplay
                    </AnalysisContent>
                </Card>
            </GameAnalysisContainer>
        );
    }

    return (
        <GameAnalysisContainer>
            <Card>
                {isLoading && <LoadingOverlay>Analyzing screenshot...</LoadingOverlay>}
                <AnalysisContent>
                    {screenshot?.aiResponse?.content || 'No analysis available'}
                </AnalysisContent>
            </Card>
        </GameAnalysisContainer>
    );
}; 