export type GameMode = 'tactical' | 'commentary' | 'esports';

export interface GameInfo {
    name: string;
    identifier: string;
    customInstructions?: string[];
}

export interface AIServiceConfig {
    apiKey: string;
    baseURL?: string;
    gameInfo?: GameInfo;
    customInstructions?: string[];
}

export interface AIResponse {
    content: string;
    timestamp: number;
    mode: GameMode;
    confidence: number;
}

export interface AIError extends Error {
    code: string;
    status: number;
    retryable: boolean;
}

export interface AISettings {
    apiKey: string;
    gameInfo: GameInfo;
    customInstructions: string[];
}

export interface AIState {
    responses: AIResponse[];
    currentMode: GameMode;
    isAnalyzing: boolean;
    error: AIError | null;
    settings: AISettings;
} 