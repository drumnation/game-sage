import type { AIResponseWithSummary } from '@electron/types';

export type GameMode = 'tactical' | 'commentary' | 'esports';

export interface GameInfo {
    name: string;
    identifier: string;
    customInstructions?: string[];
}

export interface AISettings {
    mode: GameMode;
    customInstructions: string[];
    gameInfo?: GameInfo;
    apiKey?: string;
}

export interface AIServiceConfig {
    apiKey: string;
    baseURL?: string;
    gameInfo?: GameInfo;
    customInstructions?: string[];
}

export interface AIError extends Error {
    code?: string;
    status?: number;
    retryable?: boolean;
}

export interface AIResponse {
    content: string;
    summary: string;
    timestamp: number;
    mode: GameMode;
    role: 'assistant';
    confidence?: number;
}

export interface AIState {
    settings: AISettings;
    currentAnalysis: AIResponseWithSummary | null;
    isAnalyzing: boolean;
    error: string | null;
    responses: AIResponseWithSummary[];
    currentMode: GameMode;
    isMuted: boolean;
}

export interface AIMemoryEntry {
    timestamp: number;
    summary: string;
    mode: GameMode;
} 