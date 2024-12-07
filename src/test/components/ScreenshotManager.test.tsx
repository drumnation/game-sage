import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
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
        expect(button).toHaveAttribute('data-loading', 'false');

        // Click and check loading state
        fireEvent.click(button);
        await waitFor(() => {
            expect(button).toHaveAttribute('data-loading', 'true');
        });

        // Wait for capture to complete
        await waitFor(() => {
            expect(button).toHaveAttribute('data-loading', 'false');
        }, { timeout: 200 });
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

        fireEvent.click(getCaptureButton());
        await waitFor(() => {
            expect(onError).toHaveBeenCalledWith(error);
            expect(screen.getByText(error.message)).toBeInTheDocument();
        });
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

        // Click and check disabled state
        fireEvent.click(button);
        await waitFor(() => {
            expect(button).toHaveAttribute('data-loading', 'true');
            expect(button).toBeDisabled();
        });

        // Wait for capture to complete
        await waitFor(() => {
            expect(button).toHaveAttribute('data-loading', 'false');
            expect(button).not.toBeDisabled();
        }, { timeout: 200 });
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

        fireEvent.click(getCaptureButton());
        await waitFor(() => {
            expect(onCapture).toHaveBeenCalled();
        });
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
            fireEvent.click(getCaptureButton());
            await waitFor(() => {
                expect(screen.getByText(firstError.message)).toBeInTheDocument();
            });

            // Start new capture
            fireEvent.click(getCaptureButton());
            await waitFor(() => {
                expect(screen.queryByText(firstError.message)).not.toBeInTheDocument();
            });
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
            fireEvent.click(getCaptureButton());
            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error1);
                expect(screen.getByText(error1.message)).toBeInTheDocument();
            });

            // Second error
            fireEvent.click(getCaptureButton());
            await waitFor(() => {
                expect(onError).toHaveBeenCalledWith(error2);
                expect(screen.getByText(error2.message)).toBeInTheDocument();
            });
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

            // Click and check loading state
            fireEvent.click(button);
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();
            });

            // Try clicking while loading
            fireEvent.click(button);
            fireEvent.click(button);

            // Wait for capture to complete
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'false');
                expect(button).not.toBeDisabled();
                expect(onCapture).toHaveBeenCalledTimes(1);
            }, { timeout: 200 });
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

            // Click and check loading state
            fireEvent.click(button);
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();
            });

            // Wait for capture to complete
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'false');
                expect(button).not.toBeDisabled();
            }, { timeout: 200 });
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

            // Click and check loading state
            fireEvent.click(button);
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();
            });

            // Try clicking again while capturing
            fireEvent.click(button);
            expect(onCapture).toHaveBeenCalledTimes(1);

            // Wait for capture to complete
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'false');
                expect(button).not.toBeDisabled();
            }, { timeout: 200 });
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

            // Click and check loading state
            fireEvent.click(button);
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'true');
                expect(button).toBeDisabled();
            });

            // Resolve capture
            resolveCapture?.();

            // Wait for loading state to be removed
            await waitFor(() => {
                expect(button).toHaveAttribute('data-loading', 'false');
                expect(button).not.toBeDisabled();
            });
        });
    });
});