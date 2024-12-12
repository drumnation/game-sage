import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/types';
import { analyzeScreenshot, setMode } from '../store/slices/aiSlice';
import { GameMode } from '../services/ai/types';
import type { AIResponseWithSummary, AIMemoryEntry } from '@electron/types';

export const useAI = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    responses,
    currentMode,
    isAnalyzing,
    error,
  } = useSelector((state: RootState) => state.ai);

  const analyze = useCallback(async (
    imageBase64: string,
    mode: GameMode,
    memory?: AIMemoryEntry[],
    screenshotId?: string
  ): Promise<AIResponseWithSummary | null> => {
    try {
      const result = await dispatch(analyzeScreenshot({
        imageBase64,
        mode,
        memory,
        screenshotId
      })).unwrap();
      return {
        content: result.content,
        summary: result.summary || '',
        role: 'assistant'
      };
    } catch (error) {
      // If it's a duplicate request, just return null silently
      if (error === 'Duplicate analysis request') {
        console.log('[AI Hook] Skipping duplicate analysis');
        return null;
      }
      console.error('[AI Hook] Error in analyze:', error);
      throw error;
    }
  }, [dispatch]);

  const changeMode = useCallback((mode: GameMode) => {
    dispatch(setMode(mode));
  }, [dispatch]);

  return {
    responses,
    currentMode,
    isAnalyzing,
    error,
    analyze,
    changeMode,
  };
}; 