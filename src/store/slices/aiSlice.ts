import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AIState, GameMode, AIResponse, AIError, GameInfo, AISettings } from '../../services/ai/types';
import { AIService } from '../../services/ai/AIService';
import { getPromptTemplate } from '../../services/ai/promptTemplates';

const MAX_CONTEXT_LENGTH = 5;

const initialState: AIState = {
    responses: [],
    currentMode: 'tactical',
    isAnalyzing: false,
    error: null,
    conversationContext: [],
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
    { imageBase64: string; mode: GameMode },
    { rejectValue: AIError; state: { ai: AIState } }
>(
    'ai/analyzeScreenshot',
    async ({ imageBase64, mode }, { rejectWithValue, getState }) => {
        try {
            const state = getState();
            const { settings } = state.ai;

            if (!settings.apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const aiService = new AIService({
                apiKey: settings.apiKey,
                gameInfo: settings.gameInfo,
            });

            const template = getPromptTemplate(
                mode,
                settings.gameInfo,
                settings.customInstructions
            );

            const response = await aiService.analyzeScreenshot(
                imageBase64,
                template,
                state.ai.conversationContext
            );

            return {
                ...response,
                gameInfo: settings.gameInfo,
            };
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
        setMode: (state, action) => {
            state.currentMode = action.payload;
            state.conversationContext = []; // Reset context when mode changes
        },
        clearResponses: (state) => {
            state.responses = [];
            state.conversationContext = [];
        },
        updateSettings: (state, action: { payload: Partial<AISettings> }) => {
            state.settings = {
                ...state.settings,
                ...action.payload,
            };
        },
        updateGameInfo: (state, action: { payload: Partial<GameInfo> }) => {
            state.settings.gameInfo = {
                ...state.settings.gameInfo,
                ...action.payload,
            };
        },
        addCustomInstruction: (state, action: { payload: string }) => {
            state.settings.customInstructions.push(action.payload);
        },
        removeCustomInstruction: (state, action: { payload: number }) => {
            state.settings.customInstructions.splice(action.payload, 1);
        },
        clearCustomInstructions: (state) => {
            state.settings.customInstructions = [];
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
                state.responses.push(action.payload);
                state.conversationContext.push(action.payload.content);

                // Keep only the last MAX_CONTEXT_LENGTH responses in context
                if (state.conversationContext.length > MAX_CONTEXT_LENGTH) {
                    state.conversationContext = state.conversationContext.slice(-MAX_CONTEXT_LENGTH);
                }
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
} = aiSlice.actions;

export default aiSlice.reducer; 