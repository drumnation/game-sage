# Game Sage

A desktop application for intelligent game screenshot management and analysis.

## Features

- Automated screenshot capture with configurable intervals
- Scene change detection to avoid duplicate screenshots
- Real-time preview of captured screenshots
- Memory-efficient processing of high-resolution images
- Error handling and recovery for capture failures
- Configurable capture settings
  - Capture interval (1-10 seconds)
  - Scene change detection threshold
  - Image format and quality

## Development

### Prerequisites

- Node.js >= 18
- PNPM package manager
- Electron for desktop app functionality

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

### Testing

The project includes comprehensive test coverage:

- Unit tests for core services (ScreenshotService, StorageService)
- Component tests with React Testing Library
- Integration tests for Electron IPC communication
- Performance and memory management tests

### Project Structure

```
src/
├── components/          # React components
│   └── Screenshot/     # Screenshot-related components
├── electron/           # Electron main process code
│   └── services/      # Core services
├── styles/            # Global styles and theme
└── test/             # Test files
    ├── services/     # Service tests
    └── components/   # Component tests
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
