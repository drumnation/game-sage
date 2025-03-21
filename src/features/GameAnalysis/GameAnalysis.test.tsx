import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import { GameAnalysis } from './GameAnalysis';
import aiReducer from '../../store/slices/aiSlice';
import appReducer from '../../store/appSlice';
import { theme } from '../../styles/theme';
import type { AIResponse, GameMode } from '../../services/ai/types';

// Enable MapSet support for Immer
enableMapSet();

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            app: appReducer,
            ai: aiReducer,
        },
        preloadedState: {
            app: {
                isInitialized: true,
                error: null,
            },
            ai: {
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
                ...initialState,
            },
        },
    });
};

const renderWithProviders = (ui: React.ReactElement, initialState = {}) => {
    const store = createMockStore(initialState);
    return render(
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                {ui}
            </ThemeProvider>
        </Provider>
    );
};

describe('GameAnalysis', () => {
    it('shows initial message when no analysis is available', () => {
        renderWithProviders(<GameAnalysis />);
        expect(screen.getByText(/Take a screenshot to get AI analysis/i)).toBeInTheDocument();
    });

    it('shows loading state when analyzing', () => {
        renderWithProviders(<GameAnalysis />, {
            isAnalyzing: true,
        });
        expect(screen.getByText(/Analyzing screenshot/i)).toBeInTheDocument();
    });

    it('displays analysis when available', () => {
        const mockAnalysis: AIResponse = {
            content: 'Test analysis content',
            summary: 'Test analysis summary',
            timestamp: Date.now(),
            mode: 'tactical',
            confidence: 1,
            role: 'assistant'
        };
        renderWithProviders(<GameAnalysis />, {
            currentAnalysis: mockAnalysis,
        });
        expect(screen.getByText(mockAnalysis.content)).toBeInTheDocument();
    });
});