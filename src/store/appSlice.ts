import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
    isInitialized: boolean;
    error: string | null;
}

const initialState: AppState = {
    isInitialized: false,
    error: null,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setInitialized, setError, clearError } = appSlice.actions;
export default appSlice.reducer; 