import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIService } from '../../services/ai/AIService';
import type { GameMode, AIState, AISettings, GameInfo } from '../../services/ai/types';
import type { AIResponseWithSummary, AIMemoryEntry } from '@electron/types';

interface AnalyzeParams {
    imageBase64: string;
    mode: GameMode;
    memory?: AIMemoryEntry[];
    screenshotId?: string;
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
    pendingAnalysis: [],
};

// Helper to generate a unique key for a screenshot analysis request
const getAnalysisKey = (params: AnalyzeParams): string => {
    return `${params.screenshotId}`;
};

export const analyzeScreenshot = createAsyncThunk<
    AIResponseWithSummary,
    AnalyzeParams,
    { rejectValue: string; state: { ai: AIState } }
>(
    'ai/analyzeScreenshot',
    async ({ imageBase64, mode, memory, screenshotId }, { getState, rejectWithValue }) => {
        try {
            const state = getState().ai;
            const aiService = new AIService({
                apiKey: state.settings.apiKey || '',
                gameInfo: state.settings.gameInfo,
                customInstructions: state.settings.customInstructions,
            });

            return await aiService.analyzeScreenshot(
                imageBase64,
                mode,
                memory,
                screenshotId
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
        clearPendingAnalysis: (state) => {
            state.pendingAnalysis = [];
        },
        clearStaleAnalysis: (state) => {
            const now = Date.now();
            const staleTime = 5000; // 5 seconds
            state.pendingAnalysis = state.pendingAnalysis.filter(key => {
                const timestamp = parseInt(key.split('-')[0]);
                return !isNaN(timestamp) && (now - timestamp) < staleTime;
            });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeScreenshot.pending, (state, action) => {
                const analysisKey = getAnalysisKey(action.meta.arg);

                // Only skip if we already have this exact analysis pending
                if (state.pendingAnalysis.includes(analysisKey)) {
                    console.log('[AI] Analysis already pending:', {
                        screenshotId: action.meta.arg.screenshotId,
                        mode: action.meta.arg.mode,
                        pendingCount: state.pendingAnalysis.length,
                        pendingKeys: state.pendingAnalysis,
                        currentKey: analysisKey
                    });
                    return;
                }

                state.isAnalyzing = true;
                state.error = null;
                state.pendingAnalysis = [...state.pendingAnalysis, analysisKey];
            })
            .addCase(analyzeScreenshot.fulfilled, (state, action) => {
                state.isAnalyzing = false;
                state.currentAnalysis = action.payload;
                state.responses = [action.payload, ...state.responses].slice(0, 100);

                // Remove from pending array
                const analysisKey = getAnalysisKey(action.meta.arg);
                state.pendingAnalysis = state.pendingAnalysis.filter(key => key !== analysisKey);
            })
            .addCase(analyzeScreenshot.rejected, (state, action) => {
                state.isAnalyzing = false;
                state.error = action.payload || 'Failed to analyze screenshot';

                // Remove from pending array on rejection too
                if (action.meta) {
                    const analysisKey = getAnalysisKey(action.meta.arg);
                    state.pendingAnalysis = state.pendingAnalysis.filter(key => key !== analysisKey);
                }
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
    updateCustomInstruction,
    clearPendingAnalysis,
    clearStaleAnalysis
} = aiSlice.actions;
export default aiSlice.reducer; 