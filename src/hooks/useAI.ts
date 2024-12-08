import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/types';
import { analyzeScreenshot, setMode } from '../store/slices/aiSlice';
import { GameMode, AIResponse } from '../services/ai/types';

export const useAI = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    responses,
    currentMode,
    isAnalyzing,
    error,
  } = useSelector((state: RootState) => state.ai);

  const analyze = useCallback((imageBase64: string): Promise<AIResponse> => {
    return dispatch(analyzeScreenshot({ imageBase64 })).unwrap();
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