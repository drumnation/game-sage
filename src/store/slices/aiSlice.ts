import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIService } from '../../services/ai/AIService';
import type { GameMode, AIState, AISettings, GameInfo } from '../../services/ai/types';
import type { AIResponseWithSummary, AIMemoryEntry } from '@electron/types';

interface AnalyzeParams {
    imageBase64: string;
    memory?: AIMemoryEntry[];
}

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
    AIResponseWithSummary,
    AnalyzeParams,
    { rejectValue: string }
>(
    'ai/analyzeScreenshot',
    async ({ imageBase64, memory }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { ai: AIState };
            const aiService = new AIService({
                apiKey: state.ai.settings.apiKey || '',
                gameInfo: state.ai.settings.gameInfo,
                customInstructions: state.ai.settings.customInstructions,
            });

            return await aiService.analyzeScreenshot(
                imageBase64,
                state.ai.settings.mode,
                memory
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
        setMode: (state, action: PayloadAction<GameMode>) => {
            state.settings.mode = action.payload;
            state.currentMode = action.payload;
        },
        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },
        updateSettings: (state, action: PayloadAction<Partial<AISettings>>) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        updateGameInfo: (state, action: PayloadAction<GameInfo>) => {
            state.settings.gameInfo = action.payload;
        },
        addCustomInstruction: (state, action: PayloadAction<string>) => {
            state.settings.customInstructions.push(action.payload);
        },
        removeCustomInstruction: (state, action: PayloadAction<number>) => {
            state.settings.customInstructions.splice(action.payload, 1);
        },
        updateCustomInstruction: (state, action: PayloadAction<{ index: number; instruction: string }>) => {
            const { index, instruction } = action.payload;
            state.settings.customInstructions[index] = instruction;
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
                state.responses = [action.payload, ...state.responses].slice(0, 100);
            })
            .addCase(analyzeScreenshot.rejected, (state, action) => {
                state.isAnalyzing = false;
                state.error = action.payload || 'Failed to analyze screenshot';
            });
    },
});

export const {
    setMode,
    toggleMute,
    updateSettings,
    updateGameInfo,
    addCustomInstruction,
    removeCustomInstruction,
    updateCustomInstruction
} = aiSlice.actions;
export default aiSlice.reducer; 