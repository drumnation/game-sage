import { PromptTemplate, GameMode, GameInfo } from './types';

const buildSystemPrompt = (basePrompt: string, gameInfo?: GameInfo, customInstructions?: string[]): string => {
    let prompt = basePrompt;

    if (gameInfo) {
        prompt += `\n\nGame Context:\n- Game: ${gameInfo.name}\n- Type: ${gameInfo.identifier}`;
        if (gameInfo.customInstructions?.length) {
            prompt += '\n- Game-specific instructions:\n' + gameInfo.customInstructions.map(i => `  * ${i}`).join('\n');
        }
    }

    if (customInstructions?.length) {
        prompt += '\n\nCustom Instructions:\n' + customInstructions.map(i => `- ${i}`).join('\n');
    }

    return prompt;
};

const TACTICAL_BASE_PROMPT = `You are an expert gaming advisor specializing in tactical analysis. Your role is to:
1. Analyze gameplay screenshots in real-time
2. Provide strategic advice and suggestions
3. Identify potential opportunities and threats
4. Recommend optimal actions based on the current game state
Focus on actionable, concise advice that can be quickly understood during gameplay.`;

const COMMENTARY_BASE_PROMPT = `You are a professional game commentator providing engaging play-by-play analysis. Your role is to:
1. Describe the current game situation clearly and engagingly
2. Highlight interesting plays and decisions
3. Provide context for what's happening
4. Keep commentary natural and entertaining
Focus on making the gameplay experience more engaging through your commentary.`;

const ESPORTS_BASE_PROMPT = `You are a high-energy esports caster bringing excitement to every moment. Your role is to:
1. Deliver dynamic, high-energy commentary
2. Emphasize clutch plays and dramatic moments
3. Build hype for important situations
4. Use esports terminology and casting style
Focus on creating an exciting broadcast-style experience.`;

export const createPromptTemplate = (
    mode: GameMode,
    gameInfo?: GameInfo,
    customInstructions?: string[]
): PromptTemplate => {
    const templates: Record<GameMode, Omit<PromptTemplate, 'mode' | 'systemPrompt'>> = {
        tactical: {
            userPrompt: 'Analyze this gameplay moment and provide tactical advice. What are the key opportunities or threats? What should be the next strategic move?',
            maxTokens: 150,
            temperature: 0.7,
        },
        commentary: {
            userPrompt: 'Provide commentary for this gameplay moment. What\'s happening and why is it significant?',
            maxTokens: 200,
            temperature: 0.8,
        },
        esports: {
            userPrompt: 'Cast this gameplay moment in an esports style. What makes this moment exciting or significant?',
            maxTokens: 200,
            temperature: 0.9,
        },
    };

    const basePrompts: Record<GameMode, string> = {
        tactical: TACTICAL_BASE_PROMPT,
        commentary: COMMENTARY_BASE_PROMPT,
        esports: ESPORTS_BASE_PROMPT,
    };

    return {
        mode,
        systemPrompt: buildSystemPrompt(basePrompts[mode], gameInfo, customInstructions),
        ...templates[mode],
        customInstructions,
    };
};

export const getPromptTemplate = (
    mode: GameMode,
    gameInfo?: GameInfo,
    customInstructions?: string[]
): PromptTemplate => {
    return createPromptTemplate(mode, gameInfo, customInstructions);
}; 