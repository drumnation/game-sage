# Screenshot Capture Documentation

## Overview

The screenshot capture system is a core feature of GameSage that enables automatic and manual capture of game screens for AI analysis. This document outlines the implementation details, usage, and configuration options.

## Features

- Automatic screenshot capture at configurable intervals
- Manual capture via global hotkeys
- Multi-monitor support
- Configurable capture formats
- Error boundary protection
- Type-safe implementation

## Usage

### Basic Implementation

```typescript
import { useScreenshotCapture } from '@features/Screenshot/hooks/useScreenshotCapture';

const MyComponent = () => {
  const {
    captureScreenshot,
    isCapturing,
    error,
    lastScreenshot
  } = useScreenshotCapture({
    interval: 5000, // 5 seconds
    format: 'png',
    quality: 0.8
  });

  // Manual capture
  const handleCapture = async () => {
    try {
      const screenshot = await captureScreenshot();
      // Handle screenshot...
    } catch (error) {
      // Handle error...
    }
  };
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| interval | number | 5000 | Capture interval in milliseconds |
| format | 'png' \| 'jpeg' | 'png' | Screenshot format |
| quality | number | 0.8 | Image quality (0-1) |
| monitorId | string \| null | null | Specific monitor to capture |
| bounds | Rectangle \| null | null | Specific screen region to capture |

### Error Handling

The hook implements comprehensive error handling:

```typescript
try {
  await captureScreenshot();
} catch (error) {
  if (error instanceof CaptureError) {
    // Handle specific capture errors
  } else {
    // Handle general errors
  }
}
```

## Best Practices

1. **Error Boundaries**: Always wrap screenshot components in error boundaries
2. **Resource Management**: Stop automatic capture when component unmounts
3. **Type Safety**: Utilize provided TypeScript types for configuration
4. **Error Handling**: Implement proper error handling for all capture operations

## API Reference

### Hook Return Values

| Value | Type | Description |
|-------|------|-------------|
| captureScreenshot | () => Promise<Screenshot> | Function to trigger capture |
| isCapturing | boolean | Current capture status |
| error | Error \| null | Last capture error |
| lastScreenshot | Screenshot \| null | Most recent screenshot |

### Types

```typescript
interface Screenshot {
  data: Buffer;
  format: 'png' | 'jpeg';
  timestamp: number;
  dimensions: {
    width: number;
    height: number;
  };
}

interface CaptureConfig {
  interval?: number;
  format?: 'png' | 'jpeg';
  quality?: number;
  monitorId?: string;
  bounds?: Rectangle;
}
```

## Performance Considerations

- Screenshot data is automatically cleared when no longer needed
- Capture intervals are throttled to prevent performance issues
- Memory usage is optimized for long-running captures

## Known Limitations

1. High-DPI displays may require additional scaling configuration
2. Some games in exclusive fullscreen may not be capturable
3. Performance impact increases with capture frequency

## Troubleshooting

Common issues and solutions:

1. **Black Screenshots**
   - Ensure game is not in exclusive fullscreen
   - Check monitor configuration

2. **Performance Issues**
   - Reduce capture frequency
   - Lower image quality
   - Capture smaller screen regions

3. **Type Errors**
   - Ensure all required types are imported
   - Check configuration object structure

## Contributing

When contributing to the screenshot capture system:

1. Follow existing type definitions
2. Add appropriate error handling
3. Update tests for new functionality
4. Document API changes
5. Consider performance implications

```
