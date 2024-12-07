import { AIService } from '../../services/ai/AIService';
import { GameInfo, AIResponse } from '../../services/ai/types';

// Mock OpenAI at system boundary
jest.mock('openai', () => {
    const mockCreate = jest.fn().mockImplementation(() => {
        return Promise.resolve({
            choices: [{
                message: {
                    content: 'Test tactical advice: Focus on objective control',
                },
                finish_reason: 'stop',
            }],
        });
    });

    return jest.fn().mockImplementation((config) => {
        if (config.apiKey === 'invalid-key') {
            const error: OpenAIError = new Error('Invalid API key') as OpenAIError;
            error.response = {
                status: 401,
                data: {
                    error: {
                        code: 'invalid_api_key'
                    }
                }
            };
            // Return a mock that will reject
            return {
                chat: {
                    completions: {
                        create: () => Promise.reject(error)
                    }
                }
            };
        }

        return {
            chat: {
                completions: {
                    create: mockCreate
                }
            }
        };
    });
});

interface OpenAIError extends Error {
    response?: {
        status: number;
        data: {
            error: {
                code: string;
            };
        };
    };
    code?: string;
}

describe('AIService', () => {
    const mockGameInfo: GameInfo = {
        name: 'Test Game',
        identifier: 'test-game',
        customInstructions: ['Test instruction'],
    };

    let aiService: AIService;

    beforeEach(() => {
        aiService = new AIService({
            apiKey: 'test-key',
            gameInfo: mockGameInfo,
            customInstructions: ['Global test instruction'],
        });
    });

    it('should analyze screenshot and return response', async () => {
        const response = await aiService.analyzeScreenshot('base64-image', 'tactical');
        expect(response.content).toBe('Test tactical advice: Focus on objective control');
        expect(response.mode).toBe('tactical');
        expect(response.confidence).toBe(1);
    });

    it('should handle API errors gracefully', async () => {
        // Create a new service with invalid key
        const invalidService = new AIService({
            apiKey: 'invalid-key',
            gameInfo: mockGameInfo,
        });

        await expect(invalidService.analyzeScreenshot('base64-image', 'tactical'))
            .rejects
            .toMatchObject({
                message: 'Invalid API key',
                code: 'invalid_api_key',
                status: 401,
                retryable: false,
            });
    });

    it('should include previous responses in context', async () => {
        const previousResponses: AIResponse[] = [
            {
                content: 'Previous tactical advice',
                timestamp: Date.now() - 1000,
                mode: 'tactical',
                confidence: 1,
            }
        ];

        const response = await aiService.analyzeScreenshot('base64-image', 'tactical', previousResponses);
        expect(response.content).toBe('Test tactical advice: Focus on objective control');
        expect(response.mode).toBe('tactical');
        expect(response.confidence).toBe(1);
    });
});