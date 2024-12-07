import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { message } from 'antd';
import { ScreenshotManager } from './ScreenshotManager';
import type { CaptureFrame } from './ScreenshotManager.types';
import { theme } from '../../../styles/theme';
import type { ElectronAPI } from '../../../../electron/types/electron-api';

// Mock electronAPI with required methods
const mockElectronAPI: Pick<ElectronAPI, 'on' | 'off' | 'getConfig' | 'updateConfig'> = {
    on: jest.fn(),
    off: jest.fn(),
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
};

// Mock antd message
jest.mock('antd', () => ({
    ...jest.requireActual('antd'),
    message: {
        error: jest.fn(),
    },
}));

// Mock child components
jest.mock('../ScreenshotGrid/ScreenshotGrid', () => ({
    ScreenshotGrid: () => <div data-testid="screenshot-grid">Grid Mock</div>,
}));

jest.mock('../ScreenshotSettings/ScreenshotSettings', () => ({
    ScreenshotSettings: () => <div data-testid="screenshot-settings">Settings Mock</div>,
}));

describe('ScreenshotManager', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup window.electronAPI mock with correct type
        (window as Window & typeof globalThis & { electronAPI: typeof mockElectronAPI }).electronAPI = mockElectronAPI;
    });

    it('renders without crashing', () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        expect(screen.getByText('Start')).toBeInTheDocument();
        expect(screen.getByText('Capture Now')).toBeInTheDocument();
    });

    it('handles start/stop capture', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        // Test start capture
        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 1000 });
        });

        // Test stop capture
        const stopButton = screen.getByText('Stop');
        fireEvent.click(stopButton);

        await waitFor(() => {
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 0 });
        });
    });

    it('handles capture frame events', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        // Verify event listener was registered
        expect(mockElectronAPI.on).toHaveBeenCalledWith('capture-frame', expect.any(Function));

        // Get the registered callback
        const [[, callback]] = (mockElectronAPI.on as jest.Mock).mock.calls;

        // Simulate a capture frame event
        const mockFrame: CaptureFrame = {
            buffer: Buffer.from('test'),
            metadata: {
                timestamp: Date.now(),
                displayId: 'test-display',
                width: 1920,
                height: 1080,
                format: 'jpeg',
            },
        };

        callback(mockFrame);

        // Verify error handling
        callback({ error: 'Test error' });
        expect(message.error).toHaveBeenCalledWith('Test error');
    });

    it('handles capture errors gracefully', async () => {
        (mockElectronAPI.updateConfig as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const startButton = screen.getByText('Start');
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(message.error).toHaveBeenCalledWith('Failed to start capture: Test error');
        });
    });

    it('cleans up event listeners on unmount', () => {
        const { unmount } = render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        unmount();

        expect(mockElectronAPI.off).toHaveBeenCalledWith('capture-frame', expect.any(Function));
    });
}); 