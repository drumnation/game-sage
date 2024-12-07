# ScreenshotManager Component

The ScreenshotManager component is responsible for managing the screenshot capture functionality in GameSage. It provides a user interface for starting/stopping automatic captures, taking manual screenshots, and configuring capture settings.

## Features

- Start/Stop automatic screenshot capture
- Manual screenshot capture
- Configurable capture settings
- Multi-monitor support
- Real-time screenshot preview
- Error handling and user feedback

## Component Structure

```
ScreenshotManager/
├── ScreenshotManager.tsx       # Main component logic
├── ScreenshotManager.types.ts  # TypeScript interfaces and types
├── ScreenshotManager.styles.ts # Styled components
├── ScreenshotManager.test.tsx  # Unit tests
└── README.md                   # Documentation
```

## Usage

```tsx
import { ScreenshotManager } from './components/Screenshot/ScreenshotManager/ScreenshotManager';

function App() {
    return (
        <ScreenshotManager />
    );
}
```

## Props

Currently, the component doesn't accept any props. Configuration is handled through the Electron IPC bridge.

## Dependencies

- React
- Ant Design
- Styled Components
- Electron IPC Bridge

## IPC Communication

The component communicates with the main Electron process through the following channels:

- `capture-frame`: Receives captured screenshots
- `start-capture`: Starts automatic capture
- `stop-capture`: Stops automatic capture
- `capture-now`: Triggers manual capture
- `update-settings`: Updates capture settings

## Error Handling

The component includes comprehensive error handling for:

- Failed captures
- IPC communication errors
- Configuration errors

Errors are displayed to the user using Ant Design's message system.

## Testing

Run the tests using:

```bash
pnpm test ScreenshotManager
```

The test suite covers:

- Component rendering
- User interactions
- IPC communication
- Error handling
- Cleanup on unmount
