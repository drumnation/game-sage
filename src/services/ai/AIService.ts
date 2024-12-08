import type { AIAnalysisRequest } from '../../../window';
import { AIServiceConfig, AIResponse, AIError, GameMode } from './types';
export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    console.log('[Renderer] AIService initialized with config:', {
      baseURL: config.baseURL,
      gameInfo: config.gameInfo,
      hasApiKey: !!config.apiKey,
    });
  }

  async analyzeScreenshot(
    imageBase64: string,
    mode: GameMode,
    _previousResponses?: AIResponse[],
  ): Promise<AIResponse> {
    try {
      console.log('[Renderer] Sending screenshot for analysis:', {
        mode,
        imageSize: imageBase64.length,
        gameInfo: this.config.gameInfo?.name,
      });

      const api = window.electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      const response = await api.analyzeImage({
        imageBase64,
        mode,
        gameInfo: this.config.gameInfo,
        customInstructions: this.config.customInstructions
      } as AIAnalysisRequest);

      console.log('[Renderer] Received AI analysis response:', {
        hasContent: !!response?.content,
        contentLength: response?.content?.length,
      });

      if (!response) {
        throw new Error('No response from IPC call');
      }

      const aiResponse: AIResponse = {
        content: response.content,
        timestamp: Date.now(),
        mode,
        confidence: 1,
      };

      return aiResponse;
    } catch (error) {
      console.error('[Renderer] Error in analyzeScreenshot:', error);
      const aiError = new Error(error instanceof Error ? error.message : 'Unknown error') as AIError;
      aiError.code = 'ipc_error';
      aiError.status = 500;
      aiError.retryable = true;
      throw aiError;
    }
  }
} 