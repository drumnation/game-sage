import { PromptManager } from '../../services/ai/PromptManager';
import { GameInfo, AIResponse } from '../../services/ai/types';

describe('PromptManager', () => {
    const mockGameInfo: GameInfo = {
        name: 'Test Game',
        identifier: 'test-game',
        customInstructions: ['Instruction 1', 'Instruction 2']
    };

    const mockPreviousResponses: AIResponse[] = [
        {
            content: 'Previous tactical advice',
            summary: 'Previous tactical summary',
            timestamp: Date.now(),
            mode: 'tactical',
            confidence: 1,
            role: 'assistant'
        }
    ];

    describe('composePrompt', () => {
        it('should compose basic prompt without previous responses', () => {
            const { systemPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                gameInfo: mockGameInfo
            });

            expect(systemPrompt).toContain('Game: Test Game');
            expect(systemPrompt).toContain('Instruction 1');
            expect(systemPrompt).toContain('Instruction 2');
        });

        it('should include previous responses in the prompt', () => {
            const { userPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                gameInfo: mockGameInfo,
                previousResponses: mockPreviousResponses
            });

            expect(userPrompt).toContain('Previous tactical advice');
        });

        it('should handle missing game info', () => {
            const { systemPrompt } = PromptManager.composePrompt({
                mode: 'tactical'
            });

            expect(systemPrompt).not.toContain('Game:');
        });

        it('should handle missing custom instructions', () => {
            const gameInfoWithoutInstructions: GameInfo = {
                name: 'Test Game',
                identifier: 'test-game'
            };
            const { systemPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                gameInfo: gameInfoWithoutInstructions
            });

            expect(systemPrompt).not.toContain('Game-specific instructions');
        });

        it('should limit the number of previous responses', () => {
            const manyResponses: AIResponse[] = Array.from({ length: 10 }, (_, i) => ({
                content: `Response ${i}`,
                summary: `Summary ${i}`,
                timestamp: Date.now() - i * 1000,
                mode: 'tactical',
                confidence: 1,
                role: 'assistant'
            }));

            const { userPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                gameInfo: mockGameInfo,
                previousResponses: manyResponses,
                maxContextLength: 5
            });
            const responseCount = (userPrompt.match(/Response \d/g) || []).length;

            expect(responseCount).toBeLessThanOrEqual(5);
        });
    });
}); 