import { AIService } from '../../services/ai/AIService';
import { GameInfo, PromptTemplate } from '../../services/ai/types';

// Mock OpenAI at system boundary
jest.mock('openai', () => {
    const mockCreate = jest.fn().mockImplementation(({ messages }) => {
        // Simulate API error for invalid key
        if (messages[0].content.includes('invalid-key')) {
            throw {
                message: 'Invalid API key',
                response: {
                    status: 401,
                    data: {
                        error: {
                            code: 'invalid_api_key'
                        }
                    }
                }
            };
        }

        return Promise.resolve({
            choices: [{
                message: {
                    content: 'Test tactical advice: Focus on objective control',
                },
                finish_reason: 'stop',
            }],
        });
    });

    const OpenAIMock = jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate,
            },
        },
    }));

    return {
        __esModule: true,
        default: OpenAIMock,
    };
});

describe('AI Integration', () => {
    describe('Screenshot Analysis', () => {
        it('analyzes game screenshots with correct context', async () => {
            // Arrange
            const gameInfo: GameInfo = {
                name: 'League of Legends',
                identifier: 'lol',
                customInstructions: ['Focus on objective control', 'Track enemy positions'],
            };

            const template: PromptTemplate = {
                systemPrompt: 'Analyze League of Legends gameplay',
                userPrompt: 'What should the player do next?',
                mode: 'tactical',
                maxTokens: 300,
                temperature: 0.7,
            };

            const aiService = new AIService({
                apiKey: 'test-api-key',
                gameInfo,
            });

            // Act
            const result = await aiService.analyzeScreenshot('base64-image-data', template);

            // Assert
            expect(result).toMatchObject({
                content: expect.stringContaining('tactical advice'),
                mode: 'tactical',
                confidence: 1,
                timestamp: expect.any(Number),
            });
        });

        it('handles API errors gracefully', async () => {
            // Arrange
            const gameInfo: GameInfo = {
                name: 'League of Legends',
                identifier: 'lol',
                customInstructions: ['Focus on objective control'],
            };

            const template: PromptTemplate = {
                systemPrompt: 'invalid-key Analyze League of Legends gameplay',
                userPrompt: 'What should the player do next?',
                mode: 'tactical',
                maxTokens: 300,
                temperature: 0.7,
            };

            const aiService = new AIService({
                apiKey: 'test-api-key',
                gameInfo,
            });

            // Act & Assert
            await expect(aiService.analyzeScreenshot('base64-image-data', template))
                .rejects
                .toThrow('Invalid API key');
        });
    });
});