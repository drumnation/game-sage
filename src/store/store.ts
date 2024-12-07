import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appReducer from './appSlice';
import aiReducer from './slices/aiSlice';
import type { AppDispatch, RootState } from './types';

const aiPersistConfig = {
  key: 'ai',
  storage,
  whitelist: ['settings'] // Only persist the settings part of the AI state
};

const rootReducer = combineReducers({
  app: appReducer,
  ai: persistReducer(aiPersistConfig, aiReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 