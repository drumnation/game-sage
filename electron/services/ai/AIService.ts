import { ipcMain } from 'electron';
import { AIServiceError, AIMessage } from './AIService.types';
import type { IpcMainInvokeEvent } from 'electron';

interface AnalysisRequest {
    imageBase64: string;
    mode: 'tactical' | 'commentary' | 'esports';
    gameInfo?: {
        name: string;
        identifier: string;
        customInstructions?: string[];
    };
    customInstructions?: string[];
}

export class AIService {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1';

    private readonly SYSTEM_PROMPTS = {
        tactical: "You are an expert game analyst specializing in tactical gameplay analysis. Focus on strategic opportunities, threats, and optimal decision-making.",
        commentary: "You are a professional game commentator. Provide engaging commentary about the gameplay moment, highlighting significant actions and their impact.",
        esports: "You are an esports caster. Deliver high-energy, professional esports-style commentary about this gameplay moment, focusing on player skills and strategic decisions."
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
        const { imageBase64, mode, gameInfo, customInstructions } = request;
        console.log('[Main] Received image analysis request:', {
            mode,
            gameInfo: gameInfo?.name,
            imageSize: imageBase64.length,
            hasCustomInstructions: !!customInstructions?.length,
            customInstructions,
            gameCustomInstructions: gameInfo?.customInstructions
        });

        try {
            console.log('[Main] Preparing OpenAI API request...');
            let systemPrompt = this.SYSTEM_PROMPTS[mode];

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
                                { type: "text", text: "Analyze this gameplay moment based on the provided context." },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:image/jpeg;base64,${imageBase64}`,
                                    },
                                },
                            ],
                        },
                    ],
                    max_tokens: 300,
                    temperature: 0.7,
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