import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ScreenshotManager } from '../../features/Screenshot/components/ScreenshotManager';
import { theme } from '../../styles/theme';

const renderWithTheme = (ui: React.ReactElement) => {
    return render(
        <ThemeProvider theme={theme}>
            {ui}
        </ThemeProvider>
    );
};

describe('ScreenshotManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

    const getCaptureButton = () => screen.getByRole('button', { name: /capture screenshot/i });

    it('should show loading state while capturing', async () => {
        // Arrange
        const onCapture = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={jest.fn()}
            />
        );

        const button = getCaptureButton();

        // Initial state
        expect(button).not.toHaveAttribute('data-loading');

        await act(async () => {
            fireEvent.click(button);
            await waitForNextTick();
            // Assert loading state is shown immediately
            expect(button).toHaveAttribute('data-loading', 'true');

            // Wait for capture to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Assert loading state is removed
            expect(button).not.toHaveAttribute('data-loading');
        });
    });

    it('should handle and display capture errors', async () => {
        // Arrange
        const error = new Error('Failed to capture screenshot');
        const onCapture = jest.fn().mockRejectedValue(error);
        const onError = jest.fn();

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={onError}
            />
        );

        await act(async () => {
            fireEvent.click(getCaptureButton());
            await waitForNextTick();
        });

        // Assert
        expect(onError).toHaveBeenCalledWith(error);
        expect(screen.getByText(error.message)).toBeInTheDocument();
    });

    it('should disable interactions while capturing', async () => {
        // Arrange
        const onCapture = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={jest.fn()}
            />
        );

        const button = getCaptureButton();

        await act(async () => {
            fireEvent.click(button);
            await waitForNextTick();
            // Assert button is disabled during capture
            expect(button).toHaveAttribute('data-loading', 'true');
            expect(button).toBeDisabled();

            // Wait for capture to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // Assert button is enabled after capture
            expect(button).not.toHaveAttribute('data-loading');
            expect(button).not.toBeDisabled();
        });
    });

    it('should call onCapture when capture button is clicked', async () => {
        // Arrange
        const onCapture = jest.fn().mockResolvedValue(undefined);

        // Act
        renderWithTheme(
            <ScreenshotManager
                onCapture={onCapture}
                onError={jest.fn()}
            />
        );

        await act(async () => {
            fireEvent.click(getCaptureButton());
            await waitForNextTick();
        });

        // Assert
        expect(onCapture).toHaveBeenCalled();
    });

    describe('Accessibility', () => {
        it('should have proper button labeling', () => {
            renderWithTheme(
                <ScreenshotManager
                    onCapture={jest.fn().mockResolvedValue(undefined)}
                    onError={jest.fn()}
                />
            );
            const button = getCaptureButton();
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent('Capture Screenshot');
        });

        it('should handle keyboard navigation', () => {
            renderWithTheme(
                <ScreenshotManager
                    onCapture={jest.fn().mockResolvedValue(undefined)}
                    onError={jest.fn()}
                />
            );
            const button = getCaptureButton();
            button.focus();
            expect(document.activeElement).toBe(button);
        });
    });

    describe('Error Handling', () => {
        it('should clear error state when starting new capture', async () => {
            // Arrange
            const firstError = new Error('First error');
            const onCapture = jest.fn()
                .mockRejectedValueOnce(firstError)
                .mockResolvedValueOnce(undefined);

            // Act
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={jest.fn()}
                />
            );

            // Trigger first error
            await act(async () => {
                fireEvent.click(getCaptureButton());
                await waitForNextTick();
            });

            // Assert error is shown
            expect(screen.getByText(firstError.message)).toBeInTheDocument();

            // Start new capture
            await act(async () => {
                fireEvent.click(getCaptureButton());
                await waitForNextTick();
            });

            // Assert error is cleared
            expect(screen.queryByText(firstError.message)).not.toBeInTheDocument();
        });

        it('should handle multiple errors in sequence', async () => {
            // Arrange
            const error1 = new Error('First error');
            const error2 = new Error('Second error');
            const onCapture = jest.fn()
                .mockRejectedValueOnce(error1)
                .mockRejectedValueOnce(error2);
            const onError = jest.fn();

            // Act & Assert - first error
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={onError}
                />
            );

            // First error
            await act(async () => {
                fireEvent.click(getCaptureButton());
                await waitForNextTick();
            });

            expect(onError).toHaveBeenCalledWith(error1);
            expect(screen.getByText(error1.message)).toBeInTheDocument();

            // Second error
            await act(async () => {
                fireEvent.click(getCaptureButton());
                await waitForNextTick();
            });

            expect(onError).toHaveBeenCalledWith(error2);
            expect(screen.getByText(error2.message)).toBeInTheDocument();
        });
    });

    describe('State Transitions', () => {
        it('should handle rapid capture requests', async () => {
            // Arrange
            const onCapture = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

            // Act
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={jest.fn()}
                />
            );

            const button = getCaptureButton();

            await act(async () => {
                fireEvent.click(button);
                await waitForNextTick();
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();

                // Try clicking while loading
                fireEvent.click(button);
                fireEvent.click(button);

                await new Promise(resolve => setTimeout(resolve, 100));
                expect(button).not.toHaveAttribute('data-loading');
                expect(button).not.toBeDisabled();
                expect(onCapture).toHaveBeenCalledTimes(1);
            });
        });

        it('should maintain button state during capture lifecycle', async () => {
            // Arrange
            const onCapture = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

            // Act
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={jest.fn()}
                />
            );

            const button = getCaptureButton();

            await act(async () => {
                fireEvent.click(button);
                await waitForNextTick();
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();

                await new Promise(resolve => setTimeout(resolve, 100));
                expect(button).not.toHaveAttribute('data-loading');
                expect(button).not.toBeDisabled();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle disabled state when button is clicked during capture', async () => {
            // Arrange
            const onCapture = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));

            // Act
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={jest.fn()}
                />
            );

            const button = getCaptureButton();

            await act(async () => {
                fireEvent.click(button);
                await waitForNextTick();
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();

                // Try clicking again while capturing
                fireEvent.click(button);
                expect(onCapture).toHaveBeenCalledTimes(1);

                await new Promise(resolve => setTimeout(resolve, 100));
                expect(button).not.toHaveAttribute('data-loading');
                expect(button).not.toBeDisabled();
            });
        });

        it('should handle capture cancellation', async () => {
            // Arrange
            let resolveCapture: ((value: void) => void) | undefined;
            const onCapture = jest.fn().mockImplementation(() => new Promise<void>(resolve => {
                resolveCapture = resolve;
            }));

            // Act
            renderWithTheme(
                <ScreenshotManager
                    onCapture={onCapture}
                    onError={jest.fn()}
                />
            );

            const button = getCaptureButton();

            await act(async () => {
                fireEvent.click(button);
                await waitForNextTick();
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();

                // Resolve capture
                resolveCapture?.();
                await waitForNextTick();

                expect(button).not.toHaveAttribute('data-loading');
                expect(button).not.toBeDisabled();
            });
        });
    });
});