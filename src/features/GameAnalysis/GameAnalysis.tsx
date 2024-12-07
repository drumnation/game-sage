import React from 'react';
import { useAppSelector } from '../../store';
import { Card } from '../../components/atoms/Card';
import { GameAnalysisContainer, AnalysisContent, LoadingOverlay } from './GameAnalysis.styles';
import type { RootState } from '../../store/types';

export const GameAnalysis: React.FC = () => {
    const aiResponse = useAppSelector((state: RootState) => state.ai.currentAnalysis);
    const isLoading = useAppSelector((state: RootState) => state.ai.isAnalyzing);

    if (!aiResponse && !isLoading) {
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
                    {aiResponse?.content || 'No analysis available'}
                </AnalysisContent>
            </Card>
        </GameAnalysisContainer>
    );
}; 