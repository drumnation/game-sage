import { PromptManager } from '../../services/ai/PromptManager';
import { GameInfo, AIResponse } from '../../services/ai/types';

describe('PromptManager', () => {
    const mockGameInfo: GameInfo = {
        name: 'Test Game',
        identifier: 'test-game',
        customInstructions: ['Focus on player positioning'],
    };

    const mockPreviousResponses: AIResponse[] = [
        {
            content: 'Previous tactical advice',
            timestamp: Date.now() - 1000,
            mode: 'tactical',
            confidence: 1,
        }
    ];

    describe('composePrompt', () => {
        it('should compose basic prompt without additional context', () => {
            const { systemPrompt, userPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
            });

            expect(systemPrompt).toContain('expert gaming advisor');
            expect(systemPrompt).not.toContain('Game Context');
            expect(userPrompt).toContain('Analyze this gameplay moment');
            expect(userPrompt).not.toContain('Previous context');
        });

        it('should include game info in prompt', () => {
            const { systemPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                gameInfo: mockGameInfo,
            });

            expect(systemPrompt).toContain('Game Context');
            expect(systemPrompt).toContain('Test Game');
            expect(systemPrompt).toContain('test-game');
            expect(systemPrompt).toContain('Focus on player positioning');
        });

        it('should include custom instructions in prompt', () => {
            const customInstructions = ['Pay attention to resource management'];
            const { systemPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                customInstructions,
            });

            expect(systemPrompt).toContain('Custom Instructions');
            expect(systemPrompt).toContain('Pay attention to resource management');
        });

        it('should include previous responses in user prompt', () => {
            const { userPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                previousResponses: mockPreviousResponses,
            });

            expect(userPrompt).toContain('Previous context');
            expect(userPrompt).toContain('Previous tactical advice');
        });

        it('should respect maxContextLength for previous responses', () => {
            const manyResponses: AIResponse[] = Array.from({ length: 10 }, (_, i) => ({
                content: `Response ${i + 1}`,
                timestamp: Date.now() - (i * 1000),
                mode: 'tactical',
                confidence: 1,
            }));

            const { userPrompt } = PromptManager.composePrompt({
                mode: 'tactical',
                previousResponses: manyResponses,
                maxContextLength: 3,
            });

            const responseMatches = userPrompt.match(/Response \d+/g) || [];
            expect(responseMatches).toHaveLength(3);
            expect(userPrompt).toContain('Response 8');
            expect(userPrompt).toContain('Response 9');
            expect(userPrompt).toContain('Response 10');
        });

        it('should compose different prompts for each mode', () => {
            const tacticalPrompt = PromptManager.composePrompt({ mode: 'tactical' });
            const commentaryPrompt = PromptManager.composePrompt({ mode: 'commentary' });
            const esportsPrompt = PromptManager.composePrompt({ mode: 'esports' });

            expect(tacticalPrompt.systemPrompt).toContain('expert gaming advisor');
            expect(commentaryPrompt.systemPrompt).toContain('professional game commentator');
            expect(esportsPrompt.systemPrompt).toContain('high-energy esports caster');

            expect(tacticalPrompt.userPrompt).toContain('tactical advice');
            expect(commentaryPrompt.userPrompt).toContain('commentary');
            expect(esportsPrompt.userPrompt).toContain('esports style');
        });
    });

    describe('utility methods', () => {
        it('should get base prompt for mode', () => {
            const tacticalBase = PromptManager.getBasePrompt('tactical');
            expect(tacticalBase).toContain('expert gaming advisor');
        });

        it('should get user prompt for mode', () => {
            const tacticalUser = PromptManager.getUserPrompt('tactical');
            expect(tacticalUser).toContain('tactical advice');
        });
    });
}); 