# Card Component

A basic card component that provides a bordered, elevated surface for content.

## Usage

```tsx
import { Card } from '@atoms/Card';

function Example() {
  return (
    <Card>
      <h1>Card Title</h1>
      <p>Card content goes here</p>
    </Card>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | Content to be rendered inside the card |
| cover | ReactNode | No | Content to be rendered at the top of the card |
| onClick | () => void | No | Click handler for the card |
| className | string | No | Additional CSS class names |

## Features

- Basic card container with consistent styling
- Optional cover image or content
- Click handling
- Custom styling support through className
- Smooth transitions for hover and active states

## Dependencies

- React
- styled-components
- antd (Card component)

## Accessibility

- Clickable cards have proper focus states
- Interactive elements maintain proper tab order
- ARIA attributes are preserved from antd Card component
