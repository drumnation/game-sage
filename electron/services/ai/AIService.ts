import { ipcMain } from 'electron';
import { AIServiceError, AIMessage } from './AIService.types';
import type { IpcMainInvokeEvent } from 'electron';
import { GameMode } from '../../services/ai/types';

interface AnalysisRequest {
    imageBase64: string;
    mode: GameMode;
    gameInfo?: {
        name: string;
        identifier: string;
        customInstructions?: string[];
    };
    customInstructions?: string[];
    memory?: Array<{
        timestamp: number;
        summary: string;
        mode: GameMode;
    }>;
    narrationMode?: boolean;
    captureInterval?: number;
}

export class AIService {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1';

    private readonly SYSTEM_PROMPTS = {
        tactical: `You are an expert game analyst specializing in tactical gameplay analysis. Be creative and varied in your analysis style while focusing on strategic opportunities, threats, and optimal decision-making. Feel free to use analogies, metaphors, and varied language to make your advice more engaging and memorable.

IMPORTANT: You must respond with a JSON object containing two fields:
- content: A detailed analysis with actionable, concise advice that can be quickly understood during gameplay. Vary your language and presentation style to keep it engaging. NEVER start with the same phrase twice - be wildly creative with your opening words.
- summary: A carefully crafted summary that captures the most important tactical insight or recommendation in a memorable way. This summary should be concise but complete enough to stand alone.

If narration mode is enabled:
- Keep your content extremely brief and focused
- Use short, punchy sentences
- Focus on the single most important observation
- Aim for content that can be spoken in one breath
- Avoid complex explanations or multiple points
- NEVER use the same opening phrase twice

Example varied openings:
- "Hold up! That positioning is..."
- "Now this is interesting..."
- "Quick tactical note:"
- "Watch closely here..."
- "Time to adapt!"
- "Strategic opportunity:"
- "Red alert!"
- "Critical moment:"
- "Game-changing setup:"
- "Tactical insight:"

Example response format:
{
    "content": "The enemy team has established strong control over the middle lane with heavy ward coverage, but they've left their jungle entrances exposed. This creates an opportunity for a flanking maneuver through their jungle. Consider sending two players to clear wards while maintaining pressure in other lanes. Their carry is also consistently overextending without proper support, making them vulnerable to a coordinated gank.",
    "summary": "Enemy team's strong mid control has left their jungle exposed - exploit this weakness with a coordinated flank while punishing their overextended carry"
}`,
        commentary: `You are a professional game commentator with a dynamic and engaging style. Be creative and varied in your commentary, using different narrative techniques, metaphors, and storytelling approaches to make each moment unique and exciting. Feel free to develop your own catchphrases and signature style.

IMPORTANT: You must respond with a JSON object containing two fields:
- content: Your full, engaging commentary about the current gameplay moment. Use varied language, pacing, and tone to keep it fresh and exciting. NEVER start with the same phrase twice - be wildly creative with your opening words.
- summary: A one-sentence highlight that captures the essence of the moment in a memorable way.

If narration mode is enabled:
- Keep your content extremely brief and focused
- Use short, punchy sentences
- Focus on the single most exciting moment
- Aim for content that can be spoken in one breath
- Avoid complex descriptions or multiple events
- NEVER use the same opening phrase twice

Example varied openings:
- "What a sight!"
- "In a stunning turn..."
- "Ladies and gentlemen..."
- "Would you look at that!"
- "This is unbelievable!"
- "Talk about intensity!"
- "Now that's what I call..."
- "You won't believe this..."
- "Here comes the action!"
- "Just when you thought..."
- "Out of nowhere..."
- "This is the moment..."
- "Feast your eyes on..."
- "Breaking news!"
- "Hold onto your seats!"

Example response format:
{
    "content": "Your creative commentary here...",
    "summary": "Brief but memorable highlight of the key moment"
}`,
        esports: `You are a high-energy esports caster bringing excitement to every moment. Be bold, creative, and unpredictable in your casting style. Feel free to coin new phrases, create hype moments, and vary your energy levels to match the intensity of the gameplay. Think of yourself as a mix between a sports commentator and an entertainer.

IMPORTANT: You must respond with a JSON object containing two fields:
- content: Your full, high-energy esports cast of the moment. Make each cast unique and memorable. NEVER start with the same phrase twice - be wildly creative with your opening words.
- summary: A one-sentence highlight that captures the most exciting aspect in an unforgettable way.

If narration mode is enabled:
- Keep your content extremely brief and focused
- Use short, punchy sentences
- Focus on the single most hype-worthy moment
- Aim for content that can be spoken in one breath
- Avoid complex play-by-play or multiple events
- NEVER use the same opening phrase twice

Example varied openings:
- "ARE YOU KIDDING ME!"
- "OH MY GOODNESS!"
- "THIS IS INSANE!"
- "WHAT JUST HAPPENED!"
- "ABSOLUTELY INCREDIBLE!"
- "NO WAY NO WAY!"
- "STOP WHAT YOU'RE DOING!"
- "CAN YOU BELIEVE IT!"
- "THIS IS UNREAL!"
- "HOLY MOLY!"
- "BY THE GAMING GODS!"
- "WHAT A PLAY!"
- "HISTORY IN THE MAKING!"
- "MIND = BLOWN!"
- "SOMEBODY CLIP THAT!"

Example response format:
{
    "content": "Your dynamic esports cast here...",
    "summary": "Epic highlight of the most intense moment"
}`
    };

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key is not set in environment variables');
        }
        this.apiKey = apiKey;
        console.log('[Main] AIService initialized with API key:', apiKey.slice(0, 5) + '...');

        // Bind all methods to preserve 'this' context
        this.handleIPCEvent = this.handleIPCEvent.bind(this);
        this.handleImageAnalysis = this.handleImageAnalysis.bind(this);
        this.analyzeImage = this.analyzeImage.bind(this);
        this.initializeIpcHandlers = this.initializeIpcHandlers.bind(this);

        this.initializeIpcHandlers();
    }

    private initializeIpcHandlers(): void {
        // Register the IPC handler with bound method
        ipcMain.handle('ai:analyze-image', this.handleImageAnalysis);
        console.log('[Main] IPC handlers initialized for ai:analyze-image');
    }

    private async handleImageAnalysis(
        _event: IpcMainInvokeEvent,
        request: AnalysisRequest
    ): Promise<AIMessage> {
        const { imageBase64, mode, gameInfo, customInstructions, memory, narrationMode, captureInterval } = request;
        console.log('[Main] Received image analysis request:', {
            mode,
            gameInfo: gameInfo?.name,
            imageSize: imageBase64.length,
            hasCustomInstructions: !!customInstructions?.length,
            customInstructions,
            gameCustomInstructions: gameInfo?.customInstructions,
            memoryCount: memory?.length || 0,
            narrationMode,
            captureInterval
        });

        try {
            console.log('[Main] Preparing OpenAI API request...');
            let systemPrompt = this.SYSTEM_PROMPTS[mode];

            // Add narration mode context if enabled
            if (narrationMode && captureInterval) {
                const wordsPerMinute = 55; // Reduced from 75 to get 25% shorter content
                const targetWordCount = Math.floor((captureInterval / 1000 / 60) * wordsPerMinute);
                systemPrompt += `\n\nNarration Mode is enabled. Your content MUST be extremely brief and focused:
- Target MAXIMUM ${targetWordCount} words (STRICT LIMIT - shorter is better)
- Must be spoken comfortably within ${captureInterval / 1000} seconds
- Focus on a single key observation or moment
- Use the shortest possible sentences
- Make every word count - no filler words
- Be extremely concise - use fewer words than you think necessary`;
            }

            // Add game context if available
            if (gameInfo) {
                systemPrompt += `\n\nGame Context:\n- Game: ${gameInfo.name}\n- Type: ${gameInfo.identifier}`;
                if (gameInfo.customInstructions?.length) {
                    systemPrompt += '\nGame-specific instructions:\n' +
                        gameInfo.customInstructions.map(i => `- ${i}`).join('\n');
                    console.log('[Main] Added game-specific instructions:', gameInfo.customInstructions);
                }
            }

            // Add custom instructions if available
            if (customInstructions?.length) {
                systemPrompt += '\n\nCustom Instructions:\n' +
                    customInstructions.map(i => `- ${i}`).join('\n');
                console.log('[Main] Added custom instructions:', customInstructions);
            }

            // Add memory context if available
            let userPrompt = "Analyze this gameplay moment and provide your response in the required JSON format.";
            if (memory?.length) {
                userPrompt += "\n\nRecent observations:\n" + memory
                    .slice(-10) // Use last 10 memories for context
                    .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.summary}`)
                    .join('\n');
                console.log('[Main] Added memory context:', memory.length, 'entries');
            }

            console.log('[Main] Final system prompt:', systemPrompt);

            console.log('[Main] Making OpenAI API request with prompt:', {
                model: "gpt-4o-mini",
                systemPromptLength: systemPrompt.length,
                imageSize: imageBase64.length
            });

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: systemPrompt
                        },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: userPrompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${imageBase64}`,
                                    },
                                },
                            ],
                        },
                    ],
                    max_tokens: narrationMode ? Math.min(45, Math.floor((captureInterval || 5000) / 150)) : 500,
                    temperature: request.mode === 'tactical' ? 0.7 : request.mode === 'commentary' ? 0.85 : 0.95,
                    presence_penalty: 0.3,
                    frequency_penalty: 0.3,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('[Main] OpenAI API request failed:', error);
                throw new Error(error.error?.message || 'API request failed');
            }

            console.log('[Main] Received successful response from OpenAI');
            const data = await response.json();
            console.log('[Main] OpenAI response data:', {
                model: data.model,
                usage: data.usage,
                finishReason: data.choices[0]?.finish_reason,
                contentLength: data.choices[0]?.message?.content?.length
            });

            return {
                content: data.choices[0].message.content || '',
                role: data.choices[0].message.role as 'assistant' | 'user' | 'system'
            };
        } catch (error) {
            console.error('[Main] Error in handleImageAnalysis:', error);
            throw new AIServiceError('Failed to analyze image', error as Error);
        }
    }

    public async handleIPCEvent(channel: string, ...params: unknown[]): Promise<AIMessage> {
        console.log('[Main] Received IPC event:', channel, params);
        if (channel === 'analyzeImage' && typeof params[0] === 'object') {
            return this.analyzeImage(params[0] as AnalysisRequest);
        }
        throw new AIServiceError('Invalid channel or parameters', new Error('Invalid request'));
    }

    protected async analyzeImage(request: AnalysisRequest): Promise<AIMessage> {
        console.log('[Main] Analyzing image:', {
            mode: request.mode,
            gameInfo: request.gameInfo?.name,
            imageSize: request.imageBase64.length
        });
        return this.handleImageAnalysis({} as IpcMainInvokeEvent, request);
    }
} 