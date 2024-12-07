import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ScreenshotManager } from '../../components/Screenshot/ScreenshotManager';
import { mockElectronAPI } from '../helpers/mockElectron';
import { theme } from '../../styles/theme';
import type { CaptureFrame, CaptureError } from '../../../electron/types/electron-api';

describe('ScreenshotManager', () => {
    const mockScreenshot: CaptureFrame = {
        buffer: Buffer.from('test-image'),
        metadata: {
            timestamp: Date.now(),
            displayId: 'display1',
            width: 1920,
            height: 1080,
            format: 'jpeg',
            isSceneChange: false
        }
    };

    type CaptureCallback = (data: CaptureFrame | CaptureError) => void;

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

        fireEvent.click(button);
        await waitFor(() => {
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 1000 });
            expect(button).toHaveTextContent('Stop');
        });

        fireEvent.click(button);
        await waitFor(() => {
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith({ captureInterval: 0 });
            expect(button).toHaveTextContent('Start');
        });
    });

    it('captures a single screenshot when clicking Capture Now', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const captureButton = screen.getByTestId('capture-now-button');
        fireEvent.click(captureButton);

        await waitFor(() => {
            expect(mockElectronAPI.getConfig).toHaveBeenCalled();
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith(
                expect.objectContaining({ captureInterval: 0 })
            );
        });
    });

    it('displays captured screenshots in the grid', async () => {
        const { container } = render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const mockOn = mockElectronAPI.on as jest.Mock;
        const [[channel, callback]] = mockOn.mock.calls;

        expect(channel).toBe('capture-frame');
        expect(callback).toBeDefined();
        (callback as CaptureCallback)(mockScreenshot);

        await waitFor(() => {
            // Look for the image with the correct base64 data
            const image = container.querySelector('img[src="data:image/jpeg;base64,dGVzdC1pbWFnZQ=="]');
            expect(image).toBeInTheDocument();

            // Verify the timestamp is displayed
            const timestamp = new Date(mockScreenshot.metadata.timestamp).toLocaleString();
            const timestampElement = screen.getByText(timestamp);
            expect(timestampElement).toBeInTheDocument();

            // Verify the resolution is displayed
            const resolution = `${mockScreenshot.metadata.width}x${mockScreenshot.metadata.height}`;
            const resolutionElement = screen.getByText(resolution);
            expect(resolutionElement).toBeInTheDocument();
        });
    });

    it('handles capture errors gracefully', async () => {
        render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        const mockOn = mockElectronAPI.on as jest.Mock;
        const [[, callback]] = mockOn.mock.calls;

        expect(callback).toBeDefined();
        (callback as CaptureCallback)({ error: 'Failed to capture screenshot' });

        await waitFor(() => {
            expect(screen.getByText('Failed to capture screenshot')).toBeInTheDocument();
        });
    });

    it('updates screenshot settings correctly', async () => {
        const { container } = render(
            <ThemeProvider theme={theme}>
                <ScreenshotManager />
            </ThemeProvider>
        );

        // Find the interval slider
        const intervalSlider = screen.getByTestId('interval-slider');
        expect(intervalSlider).toBeInTheDocument();

        // Find the actual Slider component
        const slider = container.querySelector('.ant-slider');
        expect(slider).toBeInTheDocument();

        // Simulate click on the slider track at 50%
        const sliderRail = slider!.querySelector('.ant-slider-rail');
        expect(sliderRail).toBeInTheDocument();

        const rect = sliderRail!.getBoundingClientRect();
        fireEvent.mouseDown(sliderRail!, {
            clientX: rect.left + rect.width * 0.5,
            clientY: rect.top + rect.height / 2
        });

        await waitFor(() => {
            expect(mockElectronAPI.updateConfig).toHaveBeenCalledWith(
                expect.objectContaining({
                    captureInterval: expect.any(Number)
                })
            );
        }, { timeout: 2000 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
}); 