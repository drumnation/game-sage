import { GameMode, GameInfo, AIResponse } from './types';

export interface PromptConfig {
    mode: GameMode;
    gameInfo?: GameInfo;
    customInstructions?: string[];
    previousResponses?: AIResponse[];
    maxContextLength?: number;
}

export interface ComposedPrompt {
    systemPrompt: string;
    userPrompt: string;
}

export class PromptManager {
    private static readonly BASE_PROMPTS: Record<GameMode, string> = {
        tactical: `You are an expert gaming advisor specializing in tactical analysis. Your role is to:
1. Analyze gameplay screenshots in real-time
2. Provide strategic advice and suggestions
3. Identify potential opportunities and threats
4. Recommend optimal actions based on the current game state

IMPORTANT: You must respond with a JSON object containing two fields:
- content: A detailed analysis with actionable, concise advice that can be quickly understood during gameplay
- summary: A one-sentence summary of the key tactical insight or recommendation

Example response format:
{
    "content": "Your detailed tactical analysis here...",
    "summary": "Brief one-line summary of key tactical point"
}`,

        commentary: `You are a professional game commentator providing engaging play-by-play analysis. Your role is to:
1. Describe the current game situation clearly and engagingly
2. Highlight interesting plays and decisions
3. Provide context for what's happening
4. Keep commentary natural and entertaining

IMPORTANT: You must respond with a JSON object containing two fields:
- content: Your full, engaging commentary about the current gameplay moment
- summary: A one-sentence highlight of the most significant aspect

Example response format:
{
    "content": "Your detailed commentary here...",
    "summary": "Brief one-line highlight of the key moment"
}`,

        esports: `You are a high-energy esports caster bringing excitement to every moment. Your role is to:
1. Deliver dynamic, high-energy commentary
2. Emphasize clutch plays and dramatic moments
3. Build hype for important situations
4. Use esports terminology and casting style

IMPORTANT: You must respond with a JSON object containing two fields:
- content: Your full, high-energy esports cast of the moment
- summary: A one-sentence highlight of the most exciting aspect

Example response format:
{
    "content": "Your detailed esports cast here...",
    "summary": "Brief one-line highlight of the epic moment"
}`
    };

    private static readonly USER_PROMPTS: Record<GameMode, string> = {
        tactical: 'Analyze this gameplay moment and provide tactical advice in the required JSON format. What are the key opportunities or threats? What should be the next strategic move?',
        commentary: 'Provide commentary for this gameplay moment in the required JSON format. What\'s happening and why is it significant?',
        esports: 'Cast this gameplay moment in an esports style using the required JSON format. What makes this moment exciting or significant?'
    };

    public static composePrompt(config: PromptConfig): ComposedPrompt {
        const { mode, gameInfo, customInstructions, previousResponses } = config;
        let systemPrompt = this.BASE_PROMPTS[mode];

        // Add game context if available
        if (gameInfo) {
            systemPrompt += `\n\nGame Context:
- Game: ${gameInfo.name}
- Type: ${gameInfo.identifier}`;

            if (gameInfo.customInstructions?.length) {
                systemPrompt += '\nGame-specific instructions:\n' +
                    gameInfo.customInstructions.map(i => `- ${i}`).join('\n');
            }
        }

        // Add custom instructions if available
        if (customInstructions?.length) {
            systemPrompt += '\n\nCustom Instructions:\n' +
                customInstructions.map(i => `- ${i}`).join('\n');
        }

        let userPrompt = this.USER_PROMPTS[mode];

        // Add context from previous responses if available
        if (previousResponses?.length) {
            const maxContextLength = config.maxContextLength || 5;
            const recentResponses = previousResponses
                .slice(-maxContextLength)
                .map(r => r.content)
                .join('\n');

            userPrompt += `\n\nPrevious context:\n${recentResponses}`;
        }

        return {
            systemPrompt,
            userPrompt
        };
    }

    public static getBasePrompt(mode: GameMode): string {
        return this.BASE_PROMPTS[mode];
    }

    public static getUserPrompt(mode: GameMode): string {
        return this.USER_PROMPTS[mode];
    }
} 