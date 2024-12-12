import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { enableMapSet } from 'immer';
import appReducer from './appSlice';
import aiReducer from './slices/aiSlice';
import hotkeyReducer from './slices/hotkeySlice';
import type { RootState } from './types';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

// Enable MapSet support for Immer
enableMapSet();

const aiPersistConfig = {
  key: 'ai',
  storage,
  whitelist: ['settings'],
  serialize: true,
  deserialize: true
};

const rootReducer = combineReducers({
  app: appReducer,
  ai: persistReducer(aiPersistConfig, aiReducer),
  hotkey: hotkeyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['ai.pendingAnalysis'],
      },
    }),
});

export const persistor = persistStore(store);

// Re-export RootState and properly type AppDispatch
export { type RootState };
export type AppDispatch = typeof store.dispatch;

// Export hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 