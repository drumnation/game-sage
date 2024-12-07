# ScreenshotPreview Component

A reusable preview component for displaying captured screenshots with metadata.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| screenshot | Screenshot | Yes | Screenshot data to display |
| isSelected | boolean | No | Whether the preview is selected |
| onClick | () => void | No | Click handler for selection |

## Usage

```tsx
import { ScreenshotPreview } from '@atoms/ScreenshotPreview';

function MyComponent() {
  return (
    <ScreenshotPreview
      screenshot={screenshotData}
      isSelected={isSelected}
      onClick={handleSelect}
    />
  );
}
```

## Accessibility

- Uses semantic HTML for metadata display
- Provides alt text for screenshot images
- Supports keyboard navigation

## Dependencies

- antd/Card
- styled-components
