import type { AIAnalysisRequest } from '../../../window';
import type { AIResponseWithSummary } from '@electron/types';
import { AIServiceConfig, AIError, GameMode, AIMemoryEntry } from './types';

// Add static debouncing for AI analysis
const AI_ANALYSIS_DEBOUNCE_TIME = 1000; // 1 second
let lastAnalysisTime = 0;
let lastAnalysisId: string | null = null;

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
    memory?: AIMemoryEntry[],
    screenshotId?: string
  ): Promise<AIResponseWithSummary> {
    try {
      // Check for duplicate analysis
      const now = Date.now();
      if (screenshotId && screenshotId === lastAnalysisId && now - lastAnalysisTime < AI_ANALYSIS_DEBOUNCE_TIME) {
        console.log('[Renderer] Skipping duplicate AI analysis request:', {
          timeSinceLastAnalysis: now - lastAnalysisTime,
          screenshotId
        });
        throw new Error('Duplicate analysis request');
      }

      console.log('[Renderer] Sending screenshot for analysis:', {
        mode,
        imageSize: imageBase64.length,
        gameInfo: this.config.gameInfo?.name,
        memoryCount: memory?.length || 0,
        screenshotId
      });

      const api = window.electronAPI;
      if (!api) {
        throw new Error('Electron API not available');
      }

      // Update analysis tracking
      lastAnalysisTime = now;
      if (screenshotId) {
        lastAnalysisId = screenshotId;
      }

      const response = await api.analyzeImage({
        imageBase64,
        mode,
        gameInfo: this.config.gameInfo,
        customInstructions: this.config.customInstructions,
        memory
      } as AIAnalysisRequest);

      console.log('[Renderer] Received AI analysis response:', {
        hasContent: !!response?.content,
        contentLength: response?.content?.length,
      });

      if (!response) {
        throw new Error('No response from IPC call');
      }

      try {
        // The response is already a JSON object, no need to parse it
        if (typeof response.content === 'string') {
          // Strip markdown code block formatting if present
          let contentToProcess = response.content;
          if (contentToProcess.startsWith('```json')) {
            contentToProcess = contentToProcess
              .replace(/^```json\n/, '') // Remove opening ```json
              .replace(/\n```$/, ''); // Remove closing ```
          } else if (contentToProcess.startsWith('```')) {
            contentToProcess = contentToProcess
              .replace(/^```\n/, '') // Remove opening ```
              .replace(/\n```$/, ''); // Remove closing ```
          }

          // Try to parse the cleaned content
          const parsedResponse = JSON.parse(contentToProcess);
          return {
            content: parsedResponse.content,
            summary: parsedResponse.summary || this.extractSummary(parsedResponse.content),
            role: 'assistant'
          };
        } else {
          // If it's not a string, it's already an object
          return {
            content: response.content,
            summary: this.extractSummary(response.content),
            role: 'assistant'
          };
        }
      } catch (parseError) {
        console.error('[Renderer] Error parsing AI response:', parseError);
        // Fallback to legacy format if JSON parsing fails
        return {
          content: response.content,
          summary: this.extractSummary(response.content),
          role: 'assistant'
        };
      }
    } catch (error) {
      console.error('[Renderer] Error in analyzeScreenshot:', error);
      const aiError = new Error(error instanceof Error ? error.message : 'Unknown error') as AIError;
      aiError.code = 'ipc_error';
      aiError.status = 500;
      aiError.retryable = true;
      throw aiError;
    }
  }

  private extractSummary(content: string): string {
    try {
      // Split content into sentences
      const sentences = content.split(/[.!?](?:\s|$)/).filter(s => s.trim().length > 0);

      if (sentences.length === 0) {
        return "No content available";
      }

      // If it's a very short response, use the whole thing
      if (content.length < 100) {
        return content;
      }

      // Look for key phrases that might indicate important information
      const keyPhrases = [
        "most importantly",
        "key point",
        "in summary",
        "therefore",
        "ultimately",
        "overall",
        "notably",
        "significantly",
        "crucially"
      ];

      // Try to find a sentence with a key phrase
      for (const phrase of keyPhrases) {
        const relevantSentence = sentences.find(s =>
          s.toLowerCase().includes(phrase.toLowerCase())
        );
        if (relevantSentence) {
          return relevantSentence.trim();
        }
      }

      // If no key phrases found, try to use a combination of first and last sentences
      if (sentences.length >= 2) {
        // If last sentence seems like a conclusion, use it
        const lastSentence = sentences[sentences.length - 1].toLowerCase();
        if (lastSentence.includes("should") ||
          lastSentence.includes("must") ||
          lastSentence.includes("recommend") ||
          lastSentence.includes("need to")) {
          return sentences[sentences.length - 1].trim();
        }
      }

      // Default to first sentence if it's substantial enough
      const firstSentence = sentences[0].trim();
      if (firstSentence.length >= 50) {
        return firstSentence;
      }

      // Combine first two sentences if they're short
      if (sentences.length >= 2 && firstSentence.length < 50) {
        return `${firstSentence} ${sentences[1].trim()}`;
      }

      return firstSentence;
    } catch (error) {
      console.error('[Renderer] Error extracting summary:', error);
      return content.substring(0, 100) + '...';
    }
  }
} 