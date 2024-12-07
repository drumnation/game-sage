import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AIState, GameMode, AIResponse, AIError, GameInfo, AISettings } from '../../services/ai/types';
import { AIService } from '../../services/ai/AIService';

const MAX_CONTEXT_LENGTH = 5;
const CONTEXT_TIME_WINDOW = 5 * 60 * 1000; // 5 minutes
const MIN_CONFIDENCE_THRESHOLD = 0.5;

const initialState: AIState = {
    responses: [],
    currentMode: 'tactical',
    isAnalyzing: false,
    error: null,
    settings: {
        apiKey: '',
        gameInfo: {
            name: '',
            identifier: '',
            customInstructions: [],
        },
        customInstructions: [],
    },
};

export const analyzeScreenshot = createAsyncThunk<
    AIResponse,
    { imageBase64: string },
    { rejectValue: AIError; state: { ai: AIState } }
>(
    'ai/analyzeScreenshot',
    async ({ imageBase64 }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { settings, currentMode, responses } = state.ai;

            if (!settings.apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const aiService = new AIService({
                apiKey: settings.apiKey,
                gameInfo: settings.gameInfo,
                customInstructions: settings.customInstructions,
            });

            // Get recent responses for context
            const recentResponses = responses
                .filter(r => r.confidence >= MIN_CONFIDENCE_THRESHOLD)
                .filter(r => (Date.now() - r.timestamp) <= CONTEXT_TIME_WINDOW)
                .slice(-MAX_CONTEXT_LENGTH);

            return await aiService.analyzeScreenshot(
                imageBase64,
                currentMode,
                recentResponses
            );
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error as AIError);
            }
            throw error;
        }
    }
);

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        setMode: (state, action: PayloadAction<GameMode>) => {
            if (state.currentMode !== action.payload) {
                state.currentMode = action.payload;
                state.responses = []; // Clear responses on mode change
            }
        },
        clearResponses: (state) => {
            state.responses = [];
        },
        updateSettings: (state, action: PayloadAction<Partial<AISettings>>) => {
            state.settings = {
                ...state.settings,
                ...action.payload,
            };
        },
        updateGameInfo: (state, action: PayloadAction<Partial<GameInfo>>) => {
            state.settings.gameInfo = {
                ...state.settings.gameInfo,
                ...action.payload,
            };
        },
        addCustomInstruction: (state, action: PayloadAction<string>) => {
            state.settings.customInstructions.push(action.payload);
        },
        removeCustomInstruction: (state, action: PayloadAction<number>) => {
            state.settings.customInstructions.splice(action.payload, 1);
        },
        clearCustomInstructions: (state) => {
            state.settings.customInstructions = [];
        },
        pruneResponses: (state) => {
            const now = Date.now();
            state.responses = state.responses
                // Remove old responses outside the time window
                .filter(response => (now - response.timestamp) <= CONTEXT_TIME_WINDOW)
                // Keep only high confidence responses
                .filter(response => response.confidence >= MIN_CONFIDENCE_THRESHOLD)
                // Keep only the most recent responses up to maxContextLength
                .slice(-MAX_CONTEXT_LENGTH);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeScreenshot.pending, (state) => {
                state.isAnalyzing = true;
                state.error = null;
            })
            .addCase(analyzeScreenshot.fulfilled, (state, action) => {
                state.isAnalyzing = false;
                state.responses.push(action.payload);
                // Prune responses after adding new one
                const now = Date.now();
                state.responses = state.responses
                    .filter(response => (now - response.timestamp) <= CONTEXT_TIME_WINDOW)
                    .filter(response => response.confidence >= MIN_CONFIDENCE_THRESHOLD)
                    .slice(-MAX_CONTEXT_LENGTH);
            })
            .addCase(analyzeScreenshot.rejected, (state, action) => {
                state.isAnalyzing = false;
                state.error = action.payload || null;
            });
    },
});

export const {
    setMode,
    clearResponses,
    updateSettings,
    updateGameInfo,
    addCustomInstruction,
    removeCustomInstruction,
    clearCustomInstructions,
    pruneResponses
} = aiSlice.actions;

export default aiSlice.reducer; 