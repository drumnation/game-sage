import type { AppState } from './appSlice';
import type { AIState } from '../services/ai/types';
import type { store } from './store';
import type { HotkeyState } from './slices/hotkeySlice';

export interface RootState {
    app: AppState;
    ai: AIState;
    hotkey: HotkeyState;
}

export type AppDispatch = typeof store.dispatch;