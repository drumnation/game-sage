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

export interface OpenAIErrorResponse {
    status: number;
    data: {
        error: {
            code: string;
            message?: string;
        };
    };
}

export interface AIError extends Error {
    code: string;
    status: number;
    retryable: boolean;
    response?: OpenAIErrorResponse;
}

export interface AISettings {
    apiKey: string;
    gameInfo: GameInfo;
    customInstructions: string[];
}

export interface AIState {
    settings: {
        apiKey?: string;
        mode: GameMode;
        customInstructions: string[];
        gameInfo?: GameInfo;
    };
    currentAnalysis: AIResponse | null;
    isAnalyzing: boolean;
    error: string | null;
    responses: AIResponse[];
    currentMode: GameMode;
    isMuted: boolean;
} 