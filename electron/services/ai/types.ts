export type GameMode = 'tactical' | 'commentary' | 'esports';

export interface AIAnalysisRequest {
    imageBase64: string;
    mode: GameMode;
    gameInfo?: {
        name: string;
        identifier: string;
        customInstructions?: string[];
    };
    customInstructions?: string[];
}

export interface AIAnalysisResponse {
    content: string;
    role: 'assistant' | 'user' | 'system';
}

export interface AIServiceError extends Error {
    code: string;
    status: number;
    retryable: boolean;
} 