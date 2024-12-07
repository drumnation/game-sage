import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appReducer from './appSlice';
import aiReducer from './slices/aiSlice';
import type { AppDispatch, RootState } from './types';
export const store = configureStore({
  reducer: {
    app: appReducer,
    ai: aiReducer,
  },
});

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 