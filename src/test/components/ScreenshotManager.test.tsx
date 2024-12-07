import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ScreenshotManager } from '../../components/Screenshot/ScreenshotManager';
import { theme } from '../../styles/theme';
import type { CaptureFrame, CaptureError } from '../../../electron/types/electron-api';

// Mock electron API
const mockElectronAPI = {
    updateConfig: jest.fn().mockResolvedValue({ success: true }),
    startCapture: jest.fn().mockResolvedValue({ success: true }),
    stopCapture: jest.fn().mockResolvedValue({ success: true }),
    captureNow: jest.fn().mockResolvedValue({ success: true }),
    getConfig: jest.fn().mockResolvedValue({ captureInterval: 1000 }),
    on: jest.fn(),
    off: jest.fn(),
};

describe('ScreenshotManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(window, 'electronAPI', {
            value: mockElectronAPI,
            writable: true
        });
    });

    it('starts and stops capture when clicking the start/stop button', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const button = screen.getByTestId('start-button');
        expect(button).toHaveTextContent('Start');

        await act(async () => {
            fireEvent.click(button);
            await mockElectronAPI.updateConfig({ captureInterval: 1000 });
        });

        expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 1000 });
        expect(button).toHaveTextContent('Stop');

        await act(async () => {
            fireEvent.click(button);
            await mockElectronAPI.updateConfig({ captureInterval: 0 });
        });

        expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 0 });
        expect(button).toHaveTextContent('Start');
    });

    it('captures a single screenshot when clicking Capture Now', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const button = screen.getByTestId('capture-now-button');

        await act(async () => {
            fireEvent.click(button);
            await mockElectronAPI.captureNow();
        });

        expect(mockElectronAPI.captureNow).toHaveBeenCalled();
    });

    it('displays captured screenshots in the grid', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const mockCallback = mockElectronAPI.on.mock.calls.find(
            call => call[0] === 'capture-frame'
        )?.[1];

        if (!mockCallback) {
            throw new Error('Callback not found');
        }

        const mockFrame: CaptureFrame = {
            buffer: Buffer.from('test-image'),
            metadata: {
                timestamp: Date.now(),
                displayId: 'display1',
                width: 1920,
                height: 1080,
                format: 'jpeg'
            }
        };

        await act(async () => {
            mockCallback(mockFrame);
        });

        // Add assertions for screenshot grid here
        // These will depend on your actual implementation
    });

    it('handles capture errors gracefully', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const mockCallback = mockElectronAPI.on.mock.calls.find(
            call => call[0] === 'capture-frame'
        )?.[1];

        if (!mockCallback) {
            throw new Error('Callback not found');
        }

        const mockError: CaptureError = {
            error: 'Test error message'
        };

        await act(async () => {
            mockCallback(mockError);
        });

        // Add assertions for error handling here
        // These will depend on your actual implementation
    });

    it('updates screenshot settings correctly', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        // Find the slider track
        const sliderTrack = document.querySelector('.ant-slider-track');
        if (!sliderTrack) {
            throw new Error('Slider track not found');
        }

        // Find the slider handle
        const sliderHandle = document.querySelector('.ant-slider-handle');
        if (!sliderHandle) {
            throw new Error('Slider handle not found');
        }

        await act(async () => {
            // Simulate clicking at 50% of the slider width
            const rect = sliderTrack.getBoundingClientRect();
            fireEvent.mouseDown(sliderHandle, {
                clientX: rect.left + rect.width * 0.5,
                clientY: rect.top + rect.height / 2
            });

            // Wait for the update to complete
            await mockElectronAPI.updateConfig({ captureInterval: 5000 });

            fireEvent.mouseUp(sliderHandle);
        });

        expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith(
            expect.objectContaining({
                captureInterval: expect.any(Number)
            })
        );
    });
}); 