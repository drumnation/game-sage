export class AIServiceError extends Error {
    constructor(message: string, public originalError: Error) {
        super(message);
        this.name = 'AIServiceError';
    }
}

export interface AIMessage {
    content: string;
    summary?: string;
    role: 'assistant' | 'user' | 'system';
} 