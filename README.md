# GameSage

Your AI-powered gaming strategist, commentator, and companion.

## Features

### Real-time Game Analysis

- Automatic screenshot capture and analysis
- Configurable screenshot settings with custom intervals and formats
- Global hotkey support for instant captures
- Multi-monitor support with selective capture
- Powered by OpenAI's GPT-4o-mini Vision API
- Multiple analysis modes:
  - Tactical Analysis: Get real-time strategic advice
  - Commentary: Enjoy professional-style game commentary
  - E-Sports Cast: Experience your gameplay through an e-sports lens

### Smart Context Management

- Maintains conversation history for coherent analysis
- Game-specific customization options
- Adaptive response system based on gameplay context
- Type-safe prompt management system
- Efficient state persistence with Redux

### Robust Architecture

- Efficient screenshot management
- Secure API key handling with Redux persist
- Comprehensive error handling and recovery
- State-of-the-art performance optimization
- Full TypeScript support with strict type checking

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM package manager
- OpenAI API key with GPT-4o-mini access

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add your OpenAI API key to .env

# Start development
pnpm dev
```

### Configuration

1. Set up your OpenAI API key in the settings
2. Configure game-specific settings
3. Choose your preferred analysis mode

## Development

### Building

bash
pnpm build

```

### Testing
```bash
pnpm test
```

### Architecture

The application uses:

- Electron for cross-platform desktop support
- React + TypeScript for the frontend
- Redux Toolkit for state management
- OpenAI GPT-4o-mini for AI analysis
- Latest OpenAI API standards for optimal performance

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

```
```
