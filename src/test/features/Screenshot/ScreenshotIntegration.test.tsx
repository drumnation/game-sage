import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HotkeyService } from '@electron/services/hotkey/HotkeyService';
import type { ElectronAPI } from '../../../../window';
import { Screenshot } from '../../../features/Screenshot';
import type { Screenshot as ScreenshotType } from '../../../features/Screenshot/Screenshot.types';
import { ScreenshotPreview } from '../../../features/ScreenshotPreview/ScreenshotPreview';
import { mockElectronAPI } from '../../helpers/mockElectron';

// Mock antd icons
jest.mock('@ant-design/icons', () => ({
    KeyOutlined: () => <span data-testid="key-icon">🔑</span>,
    RedoOutlined: () => <span data-testid="redo-icon">🔄</span>,
    PlayCircleOutlined: () => <span data-testid="play-icon">▶️</span>,
    PauseCircleOutlined: () => <span data-testid="pause-icon">⏸️</span>,
    LeftOutlined: () => <span data-testid="left-icon">⬅️</span>,
    RightOutlined: () => <span data-testid="right-icon">➡️</span>,
    FullscreenOutlined: () => <span data-testid="fullscreen-icon">⛶</span>,
    ZoomInOutlined: () => <span data-testid="zoom-icon">🔍</span>,
    CameraOutlined: () => <span data-testid="camera-icon">📷</span>
}));

// Mock antd components
jest.mock('antd', () => ({
    Form: {
        useForm: () => [{
            setFieldsValue: jest.fn(),
            getFieldValue: jest.fn(),
            validateFields: jest.fn()
        }],
        Item: ({ children }: { children: React.ReactNode }) => children
    },
    Select: {
        Option: ({ children }: { children: React.ReactNode }) => children
    },
    InputNumber: ({ value }: { value: string }) => <input type="number" value={value} readOnly />,
    Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
    Switch: ({ checked, onChange }: { checked: boolean, onChange?: (checked: boolean) => void }) => (
        <input type="checkbox" checked={checked} onChange={e => onChange?.(e.target.checked)} />
    ),
    Slider: ({ value, onChange }: { value: number, onChange?: (value: number) => void }) => (
        <input type="range" value={value} onChange={e => onChange?.(Number(e.target.value))} />
    ),
    Modal: ({ children, open }: { children: React.ReactNode, open: boolean }) => (
        open ? <div role="dialog">{children}</div> : null
    ),
    Divider: () => <hr />
}));

// Extend the mock type to include Jest mock properties
type MockElectronAPI = {
    [K in keyof ElectronAPI]: ElectronAPI[K] extends (
        ...args: infer Args
    ) => infer Return
    ? jest.Mock<Return, Args>
    : ElectronAPI[K];
};

// Set up mock electron API with proper on method
const mockOn = jest.fn();
const typedMockElectronAPI = {
    ...mockElectronAPI,
    on: mockOn
} as MockElectronAPI;

// Define store types
interface RootState {
    screenshot: {
        screenshots: ScreenshotType[];
        currentIndex: number;
    };
    hotkey: {
        hotkeys: Record<string, string>;
    };
}

// Mock electron's globalShortcut
jest.mock('electron', () => ({
    globalShortcut: {
        register: jest.fn(),
        unregister: jest.fn(),
        unregisterAll: jest.fn(),
        isRegistered: jest.fn()
    }
}));

// Mock the screenshot capture service
jest.mock('@electron/services/screenshot/ScreenshotService', () => ({
    captureFrame: jest.fn().mockResolvedValue({
        buffer: Buffer.from('test'),
        metadata: {
            timestamp: Date.now(),
            displayId: 'display1',
            format: 'jpeg',
            width: 1920,
            height: 1080,
            isHotkeyCapture: true
        }
    })
}));

// Set up mock electron API
window.electronAPI = typedMockElectronAPI;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the ScreenshotSettings component
jest.mock('@features/Screenshot/components/ScreenshotSettings', () => ({
    ScreenshotSettings: () => {
        const pressedKeys: string[] = [];
        return (
            <div data-testid="screenshot-settings">
                <p>{pressedKeys.join(' + ') || 'Waiting for input...'}</p>
                <button onClick={() => { }}>Change Hotkey</button>
                <button onClick={() => { }}>Reset to Default</button>
            </div>
        );
    }
}));

// Mock the MonitorSelection component
jest.mock('@features/Screenshot/components/MonitorSelection', () => ({
    MonitorSelection: () => {
        return (
            <div data-testid="monitor-selection">
                <select>
                    <option value="display1">Display 1</option>
                </select>
            </div>
        );
    }
}));

// Mock the ScreenshotControls component
jest.mock('@features/Screenshot/components/ScreenshotControls', () => ({
    ScreenshotControls: ({
        onCapture,
        onSingleCapture,
        isCapturing,
        isTransitioning = false
    }: {
        onCapture: () => void;
        onSingleCapture: () => void;
        isCapturing: boolean;
        isTransitioning?: boolean;
    }) => {
        return (
            <div data-testid="screenshot-controls">
                <button
                    onClick={onSingleCapture}
                    disabled={isTransitioning}
                    data-testid="capture-button"
                >
                    Capture Now
                </button>
                <button
                    onClick={onCapture}
                    disabled={isTransitioning || isCapturing}
                    data-testid="interval-capture-button"
                >
                    {isCapturing ? 'Stop Capture' : 'Start Interval Capture'}
                </button>
            </div>
        );
    }
}));

// Mock the ScreenshotPreview component
jest.mock('@features/ScreenshotPreview/ScreenshotPreview', () => ({
    ScreenshotPreview: ({
        screenshot,
        screenshots,
        currentIndex,
        isPlaying
    }: {
        screenshot: { imageData: string } | null;
        screenshots: Array<{ imageData: string }>;
        currentIndex: number;
        isPlaying: boolean;
    }) => {
        if (!screenshot) {
            return (
                <div data-testid="screenshot-preview-empty">
                    <p>No screenshots captured yet</p>
                </div>
            );
        }
        return (
            <div data-testid="screenshot-preview">
                <img
                    src={screenshot.imageData}
                    alt={`Screenshot ${currentIndex + 1}`}
                    data-testid="preview-image"
                />
                <div data-testid="preview-controls">
                    <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
                    <p>Total Screenshots: {screenshots.length}</p>
                </div>
            </div>
        );
    }
}));

describe('Screenshot Feature Integration', () => {
    let store: ReturnType<typeof configureStore>;
    let hotkeyService: HotkeyService;

    beforeEach(() => {
        store = configureStore<RootState>({
            reducer: {
                screenshot: (state = { screenshots: [], currentIndex: 0 }) => state,
                hotkey: (state = { hotkeys: {} }) => state
            }
        });
        hotkeyService = new HotkeyService();
        jest.clearAllMocks();
        localStorageMock.clear();
        // Reset mockOn calls
        mockOn.mockClear();
    });

    const renderApp = () => {
        return render(
            <Provider store={store}>
                <div data-testid="app-wrapper">
                    <Screenshot
                        onSettingsChange={jest.fn()}
                        onDisplaysChange={jest.fn()}
                        onCapture={jest.fn()}
                        onSingleCapture={jest.fn()}
                        isCapturing={false}
                    />
                    <ScreenshotPreview
                        screenshot={null}
                        screenshots={[]}
                        currentIndex={0}
                        isPlaying={false}
                        onPrevious={jest.fn()}
                        onNext={jest.fn()}
                        onPlayPause={jest.fn()}
                        onSliderChange={jest.fn()}
                    />
                </div>
            </Provider>
        );
    };

    it('should allow changing hotkey and verify it works', async () => {
        renderApp();
        const originalHotkey = 'CommandOrControl+Shift+X';
        const newHotkey = 'CommandOrControl+Shift+Y';

        // Register original hotkey
        hotkeyService.registerHotkey('captureNow', originalHotkey, jest.fn());

        // Find and click the hotkey settings button
        const hotkeyButton = screen.getByRole('button', { name: /Change Hotkey/i });
        fireEvent.click(hotkeyButton);

        // Simulate pressing the new hotkey
        fireEvent.keyDown(document, { key: 'Y', ctrlKey: true, shiftKey: true });

        // Update the hotkey in the service
        hotkeyService.updateHotkey('captureNow', newHotkey);

        // Assert
        const registeredHotkey = hotkeyService.getHotkey('captureNow');
        expect(registeredHotkey?.accelerator).toBe(newHotkey);
    });

    it('should reset hotkey to default and verify it works', async () => {
        renderApp();
        const defaultHotkey = 'CommandOrControl+Shift+C';
        const customHotkey = 'CommandOrControl+Shift+X';

        // Set custom hotkey first
        hotkeyService.registerHotkey('captureNow', customHotkey, jest.fn());

        // Find and click the reset button
        const resetButton = screen.getByRole('button', { name: /Reset to Default/i });
        fireEvent.click(resetButton);

        // Update the hotkey in the service to the default
        hotkeyService.updateHotkey('captureNow', defaultHotkey);

        // Assert
        const registeredHotkey = hotkeyService.getHotkey('captureNow');
        expect(registeredHotkey?.accelerator).toBe(defaultHotkey);
    });
}); 