import type { AppState } from './appSlice';
import type { AIState } from '../services/ai/types';
import type { store } from './store';

export interface RootState {
    app: AppState;
    ai: AIState;
}

export type AppDispatch = typeof store.dispatch;