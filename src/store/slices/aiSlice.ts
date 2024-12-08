import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIService } from '../../services/ai/AIService';
import type { AIResponse, GameMode, AIState } from '../../services/ai/types';

const initialState: AIState = {
    settings: {
        mode: 'tactical' as GameMode,
        customInstructions: [],
        gameInfo: undefined,
        apiKey: undefined,
    },
    currentAnalysis: null,
    isAnalyzing: false,
    error: null,
    responses: [],
    currentMode: 'tactical' as GameMode,
    isMuted: false,
};

export const analyzeScreenshot = createAsyncThunk<
    AIResponse,
    { imageBase64: string },
    { rejectValue: string }
>(
    'ai/analyzeScreenshot',
    async ({ imageBase64 }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { ai: AIState };
            const aiService = new AIService({
                apiKey: state.ai.settings.apiKey || '',
                gameInfo: {
                    name: 'Game',
                    identifier: 'game',
                    customInstructions: state.ai.settings.customInstructions,
                },
            });

            return await aiService.analyzeScreenshot(
                imageBase64,
                state.ai.settings.mode
            );
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to analyze screenshot');
        }
    }
);

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        updateSettings: (state, action: PayloadAction<Partial<AIState['settings']>>) => {
            state.settings = { ...state.settings, ...action.payload };
            if (action.payload.mode) {
                state.currentMode = action.payload.mode;
            }
        },
        clearAnalysis: (state) => {
            state.currentAnalysis = null;
            state.error = null;
        },
        updateGameInfo: (state, action: PayloadAction<{ name: string; identifier: string }>) => {
            if (state.settings.gameInfo) {
                state.settings.gameInfo = { ...state.settings.gameInfo, ...action.payload };
            } else {
                state.settings.gameInfo = { ...action.payload, customInstructions: [] };
            }
        },
        addCustomInstruction: (state, action: PayloadAction<string>) => {
            state.settings.customInstructions.push(action.payload);
        },
        removeCustomInstruction: (state, action: PayloadAction<number>) => {
            state.settings.customInstructions.splice(action.payload, 1);
        },
        setMode: (state, action: PayloadAction<GameMode>) => {
            state.settings.mode = action.payload;
            state.currentMode = action.payload;
        },
        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeScreenshot.pending, (state) => {
                state.isAnalyzing = true;
                state.error = null;
            })
            .addCase(analyzeScreenshot.fulfilled, (state, action) => {
                state.isAnalyzing = false;
                state.currentAnalysis = action.payload;
                state.responses = [...state.responses, action.payload];
                state.error = null;
            })
            .addCase(analyzeScreenshot.rejected, (state, action) => {
                state.isAnalyzing = false;
                state.error = action.payload || 'Failed to analyze screenshot';
            });
    },
});

export const {
    updateSettings,
    clearAnalysis,
    updateGameInfo,
    addCustomInstruction,
    removeCustomInstruction,
    setMode,
    toggleMute,
} = aiSlice.actions;
export default aiSlice.reducer; 