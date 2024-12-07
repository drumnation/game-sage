import { AIService } from '../../services/ai/AIService';
import type { AIError, GameInfo, AIServiceConfig } from '../../services/ai/types';
import type OpenAI from 'openai';

// Mock OpenAI client
jest.mock('openai', () => {
    return class MockOpenAI {
        private config: { apiKey: string; baseURL?: string };

        constructor(config: { apiKey: string; baseURL?: string }) {
            this.config = config;
        }

        chat = {
            completions: {
                create: async (params: OpenAI.Chat.ChatCompletionCreateParams): Promise<OpenAI.Chat.ChatCompletion> => {
                    if (!params.model || !params.messages) {
                        throw new Error('Missing required parameters');
                    }

                    if (this.config.apiKey === 'invalid-key') {
                        const error = new Error('Invalid API key') as AIError;
                        error.code = 'invalid_api_key';
                        error.status = 401;
                        error.retryable = false;
                        error.response = {
                            status: 401,
                            data: {
                                error: {
                                    code: 'invalid_api_key',
                                    message: 'Invalid API key provided',
                                },
                            },
                        };
                        throw error;
                    }

                    if (this.config.apiKey === 'network-error') {
                        const error = new Error('Network error') as AIError;
                        error.code = 'ECONNABORTED';
                        error.status = 500;
                        error.retryable = true;
                        throw error;
                    }

                    if (this.config.apiKey === 'api-error') {
                        const error = new Error('Bad request') as AIError;
                        error.code = 'bad_request';
                        error.status = 400;
                        error.retryable = false;
                        error.response = {
                            status: 400,
                            data: {
                                error: {
                                    code: 'bad_request',
                                    message: 'Invalid request parameters',
                                },
                            },
                        };
                        throw error;
                    }

                    const message = {
                        role: 'assistant' as const,
                        content: 'Test analysis',
                        function_call: undefined,
                        tool_calls: undefined,
                        name: undefined,
                        refusal: null,
                    } as const;

                    return {
                        id: 'mock-completion-id',
                        object: 'chat.completion',
                        created: Date.now(),
                        model: 'gpt-4o-mini',
                        choices: [{
                            message,
                            finish_reason: 'stop',
                            index: 0,
                            logprobs: null,
                        }],
                        usage: {
                            prompt_tokens: 100,
                            completion_tokens: 50,
                            total_tokens: 150,
                        },
                        system_fingerprint: undefined,
                    };
                },
            },
        };
    };
});

describe('AIService', () => {
    const mockGameInfo: GameInfo = {
        name: 'Test Game',
        identifier: 'test',
        customInstructions: ['Test instruction'],
    };

    const createConfig = (apiKey: string): AIServiceConfig => ({
        apiKey,
        gameInfo: mockGameInfo,
        customInstructions: ['Global test instruction'],
    });

    it('should handle invalid API key error', async () => {
        const service = new AIService(createConfig('invalid-key'));
        await expect(service.analyzeScreenshot('base64image', 'tactical')).rejects.toThrow('Invalid API key');
    });

    it('should handle network errors', async () => {
        const service = new AIService(createConfig('network-error'));
        await expect(service.analyzeScreenshot('base64image', 'tactical')).rejects.toThrow('Network error');
    });

    it('should handle API errors', async () => {
        const service = new AIService(createConfig('api-error'));
        await expect(service.analyzeScreenshot('base64image', 'tactical')).rejects.toThrow('Bad request');
    });

    it('should successfully analyze a screenshot', async () => {
        const service = new AIService(createConfig('valid-key'));
        const result = await service.analyzeScreenshot('base64image', 'tactical');

        expect(result).toBeDefined();
        expect(result.content).toBe('Test analysis');
        expect(result.mode).toBe('tactical');
        expect(result.confidence).toBe(1);
        expect(result.timestamp).toBeDefined();
        expect(typeof result.timestamp).toBe('number');
    });

    it('should handle custom instructions', async () => {
        const config = createConfig('valid-key');
        config.customInstructions = ['Custom instruction 1', 'Custom instruction 2'];

        const service = new AIService(config);
        const result = await service.analyzeScreenshot('base64image', 'commentary');

        expect(result).toBeDefined();
        expect(result.mode).toBe('commentary');
    });

    it('should handle custom game info instructions', async () => {
        const config = createConfig('valid-key');
        config.gameInfo = {
            name: 'Test Game',
            identifier: 'test',
            customInstructions: ['Game-specific instruction'],
        };

        const service = new AIService(config);
        const result = await service.analyzeScreenshot('base64image', 'esports');

        expect(result).toBeDefined();
        expect(result.mode).toBe('esports');
    });
});