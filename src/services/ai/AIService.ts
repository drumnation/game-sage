import OpenAI from 'openai';
import { AIServiceConfig, AIResponse, AIError, GameMode } from './types';
import { PromptManager, PromptConfig } from './PromptManager';

interface OpenAIError {
  response?: {
    status?: number;
    data?: {
      error?: {
        code?: string;
      };
    };
  };
  code?: string;
  message: string;
}

export class AIService {
  private client: OpenAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.config = config;
  }

  async analyzeScreenshot(
    imageBase64: string,
    mode: GameMode,
    previousResponses?: AIResponse[],
  ): Promise<AIResponse> {
    try {
      const promptConfig: PromptConfig = {
        mode,
        gameInfo: this.config.gameInfo,
        customInstructions: this.config.customInstructions,
        previousResponses,
      };

      const { systemPrompt, userPrompt } = PromptManager.composePrompt(promptConfig);

      const response = await this.client.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${systemPrompt}\n${userPrompt}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                }
              }
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse: AIResponse = {
        content: response.choices[0].message.content || '',
        timestamp: Date.now(),
        mode,
        confidence: response.choices[0].finish_reason === 'stop' ? 1 : 0.5,
      };

      return aiResponse;
    } catch (error) {
      const err = error as OpenAIError;
      const status = err.response?.status || 500;
      const aiError = new Error(err.message) as AIError;
      aiError.code = err.response?.data?.error?.code || err.code || 'unknown';
      aiError.status = status;
      aiError.retryable = status >= 500 || err.code === 'ECONNABORTED';
      throw aiError;
    }
  }
} 