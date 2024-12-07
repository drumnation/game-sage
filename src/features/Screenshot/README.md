# Screenshot Feature

A comprehensive screenshot management feature that allows capturing, viewing, and managing screenshots.

## Components

### Screenshot (Root)

The main component that composes all screenshot functionality together.

#### Props

- `screenshots`: Array of captured screenshots
- `selectedId`: ID of the currently selected screenshot
- `onCapture`: Callback for capturing new screenshots
- `onSelect`: Callback for selecting a screenshot
- `onError`: Optional error handling callback

### Subcomponents

- **ScreenshotManager**: Handles screenshot capture and error states
- **ScreenshotGrid**: Displays captured screenshots in a grid layout
- **ScreenshotPreview**: Displays individual screenshots with metadata

## Usage

```tsx
import { Screenshot } from '@features/Screenshot';

function App() {
    return (
        <Screenshot
            screenshots={screenshots}
            selectedId={selectedId}
            onCapture={handleCapture}
            onSelect={handleSelect}
            onError={handleError}
        />
    );
}
```

## Theme Usage

The component uses the following theme tokens:

- `colors.background`: Container background
- `spacing.md`: Container padding and gap
- `borderRadius`: Container border radius

## Accessibility

- All interactive elements are keyboard accessible
- Error states are properly announced to screen readers
- Loading states provide appropriate ARIA feedback

## Dependencies

- React
- styled-components
- Electron IPC for screenshot capture
