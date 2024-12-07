import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ScreenshotManager } from '../../features/Screenshot/components/ScreenshotManager';
import { theme } from '../../styles/theme';

// Mock electron API
const mockElectronAPI = {
    updateConfig: jest.fn().mockResolvedValue(undefined),
    startCapture: jest.fn().mockResolvedValue(undefined),
    stopCapture: jest.fn().mockResolvedValue(undefined),
    captureNow: jest.fn().mockResolvedValue(undefined),
    getConfig: jest.fn().mockResolvedValue({ captureInterval: 1000 }),
    on: jest.fn(),
    off: jest.fn(),
};

// Setup global window.electronAPI
beforeAll(() => {
    Object.defineProperty(window, 'electronAPI', {
        value: mockElectronAPI,
        writable: true
    });
});

// Reset mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});

// Cleanup after tests
afterAll(() => {
    // @ts-expect-error - Property 'electronAPI' does not exist on type 'Window & typeof globalThis'
    delete window.electronAPI;
});

const renderWithTheme = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {ui}
        </ThemeProvider>
    );
};

describe('ScreenshotManager', () => {
    it('renders without crashing', () => {
        // Arrange
        const onCapture = jest.fn();
        const onError = jest.fn();

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={onError}
                isCapturing={false}
                error={null}
            />
        );

        // Assert
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('handles capture success', async () => {
        // Arrange
        const onCapture = jest.fn().mockResolvedValue(undefined);
        const onError = jest.fn();

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={onError}
                isCapturing={false}
                error={null}
            />
        );

        // Click the capture button
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        // Assert
        expect(onCapture).toHaveBeenCalledTimes(1);
        expect(onError).not.toHaveBeenCalled();
    });

    it('handles capture error', async () => {
        // Arrange
        const error = new Error('Capture failed');
        const onCapture = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={onError}
                isCapturing={false}
                error={null}
            />
        );

        // Click the capture button
        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        // Assert
        expect(onCapture).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(error);
        expect(screen.getByText('Error')).toBeInTheDocument();
    });
}); 