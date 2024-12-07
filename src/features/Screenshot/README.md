# Screenshot Feature

The Screenshot feature provides functionality for capturing and managing screenshots within the application.

## Components

### ScreenshotSettings

New component that provides a UI for configuring screenshot capture settings including:

- Capture intervals
- Output format
- Hotkey bindings
- Monitor selection preferences

### MonitorSelection

Enhanced component for selecting which monitor to capture from, with improved UI and type safety.

### ScreenshotControls

Updated controls component with integration to the new settings system.

## Hooks

### useScreenshotCapture

Custom hook for managing the screenshot capture process, now with improved error handling and type safety.

### useHotkeyManager

New hook for managing global hotkeys related to screenshot capture.

## State Management

The feature uses Redux for state management with the following slices:

- Screenshot settings state
- Hotkey configurations
- Capture history

## Electron Integration

Communicates with the electron backend through:

- ScreenshotService for capture functionality
- HotkeyManager for global shortcuts
- Typed IPC communication channels
