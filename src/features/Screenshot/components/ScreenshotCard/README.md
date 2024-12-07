# ScreenshotCard Component

A molecule component that displays a screenshot with timestamp and selection state.

## Usage

```tsx
import { ScreenshotCard } from '@features/Screenshot/components/ScreenshotCard';

function Example() {
  return (
    <ScreenshotCard
      imageUrl="path/to/image.jpg"
      timestamp={1234567890}
      isSelected={false}
      onClick={() => console.log('clicked')}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| imageUrl | string | Yes | URL of the screenshot image |
| timestamp | number | Yes | Timestamp when the screenshot was taken |
| isSelected | boolean | No | Whether the card is currently selected |
| onClick | () => void | No | Click handler for the card |

## Features

- Displays screenshot images with proper aspect ratio
- Shows formatted timestamp
- Visual selection state
- Hover effects
- Click handling

## Dependencies

- React
- styled-components
- @atoms/Card

## Accessibility

- Images have descriptive alt text
- Clickable cards have proper focus states
- Interactive elements maintain proper tab order
- Timestamps are formatted for readability
