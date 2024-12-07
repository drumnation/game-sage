export type GameMode = 'tactical' | 'commentary' | 'esports';

export interface GameInfo {
    name: string;
    identifier: string;  // e.g., "League of Legends", "DOTA 2", etc.
    customInstructions?: string[];  // Additional game-specific instructions
}

export interface AIServiceConfig {
    apiKey: string;
    baseURL?: string;
    gameInfo?: GameInfo;
}

export interface PromptTemplate {
    mode: GameMode;
    systemPrompt: string;
    userPrompt: string;
    maxTokens?: number;
    temperature?: number;
    customInstructions?: string[];  // Additional user-defined instructions
}

export interface AIResponse {
    content: string;
    timestamp: number;
    mode: GameMode;
    confidence: number;
    gameInfo?: GameInfo;  // Include game info in response for context
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
    conversationContext: string[];
    settings: AISettings;
} 