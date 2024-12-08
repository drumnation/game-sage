import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/types';
import { analyzeScreenshot, setMode } from '../store/slices/aiSlice';
import { GameMode } from '../services/ai/types';
import type { AIResponseWithSummary, AIMemoryEntry } from '@electron/types';

interface AnalyzeParams {
  imageBase64: string;
  memory?: AIMemoryEntry[];
  narrationMode?: boolean;
  captureInterval?: number;
}

export const useAI = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    responses,
    currentMode,
    isAnalyzing,
    error,
  } = useSelector((state: RootState) => state.ai);

  const analyze = useCallback(async (params: AnalyzeParams): Promise<AIResponseWithSummary> => {
    try {
      const result = await dispatch(analyzeScreenshot(params)).unwrap();
      // Ensure the response has the required fields
      return {
        content: result.content,
        summary: result.summary || '', // Provide empty string as fallback
        role: 'assistant'
      };
    } catch (error) {
      console.error('Error in analyze:', error);
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