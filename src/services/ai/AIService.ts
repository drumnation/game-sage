import OpenAI from 'openai';
import { AIServiceConfig, AIResponse, PromptTemplate, AIError } from './types';

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

  constructor(config: AIServiceConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async analyzeScreenshot(
    imageBase64: string,
    template: PromptTemplate,
    conversationContext?: string[]
  ): Promise<AIResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${template.systemPrompt}\n${template.userPrompt}${conversationContext?.length
                    ? '\nPrevious context:\n' + conversationContext.join('\n')
                    : ''
                  }`
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
        max_tokens: template.maxTokens || 300,
        temperature: template.temperature || 0.7,
      });

      return {
        content: response.choices[0].message.content || '',
        timestamp: Date.now(),
        mode: template.mode,
        confidence: response.choices[0].finish_reason === 'stop' ? 1 : 0.5,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        throw this.handleError(error as OpenAIError);
      }
      throw new Error('Unknown error occurred');
    }
  }

  private handleError(error: OpenAIError): AIError {
    const aiError: AIError = new Error(error.message) as AIError;
    aiError.code = error.response?.data?.error?.code || 'UNKNOWN_ERROR';
    aiError.status = error.response?.status || 500;
    const status = error.response?.status ?? 500;
    aiError.retryable = status >= 500 || error.code === 'ECONNABORTED';
    return aiError;
  }
} 