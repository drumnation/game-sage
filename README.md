# GameSage

GameSage is an AI-powered gaming assistant that provides real-time insights, tactical advice, and e-sports style commentary for your games. Built with Electron, React, TypeScript, and OpenAI's Vision API.

## Features

- Real-time game screen capture
- AI-powered game analysis
- Voice interaction
- Custom hotkeys
- User-defined game profiles
- Dark theme UI with Ant Design

## Tech Stack

- **Frontend**: React, TypeScript, Styled Components, Ant Design
- **State Management**: Redux Toolkit
- **Desktop Integration**: Electron
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library
- **AI Integration**: OpenAI Vision API (coming soon)

## Project Structure

```
src/
  components/         # React components
  store/             # Redux store and slices
    store.ts         # Store configuration
    appSlice.ts      # Main app state slice
  styles/            # Global styles and theme
    theme.ts         # Theme configuration
  test/              # Test utilities and setup
    setupTests.ts    # Jest setup
    testUtils.tsx    # Testing utilities
electron/
  main.ts            # Electron main process
  preload.ts         # Preload script
  types.ts           # TypeScript types for IPC
```

## Development Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the development server:

   ```bash
   pnpm dev
   ```

3. Run tests:

   ```bash
   pnpm test
   ```

4. Build for production:

   ```bash
   pnpm build
   ```

## Testing

The project uses Jest and React Testing Library for testing. Tests are set up with:

- Jest for test running and assertions
- React Testing Library for component testing
- Custom test utilities for Redux and styled-components
- Mocked Electron API for integration testing

## Architecture

### Main Process (Electron)

- Handles window management
- Manages IPC communication
- Controls screen capture (coming soon)
- Manages system integration

### Renderer Process (React)

- Renders the UI using Ant Design
- Manages application state with Redux
- Handles user interactions
- Processes AI responses

### IPC Communication

- Type-safe IPC channels
- Bidirectional communication between main and renderer
- Structured message passing

## Documentation

### Versioning

We use [Semantic Versioning](https://semver.org/) for version numbers:

- MAJOR version for incompatible API changes (X.0.0)
- MINOR version for new functionality in a backward compatible manner (0.X.0)
- PATCH version for backward compatible bug fixes (0.0.X)

To update the version:

```bash
# For bug fixes
pnpm version:patch

# For new features
pnpm version:minor

# For breaking changes
pnpm version:major
```

These commands will:

1. Run tests to ensure everything is working
2. Update the version in package.json
3. Update CHANGELOG.md automatically based on commit history
4. Create a git tag
5. Push changes and tags to the repository

### Changelog

All notable changes are documented in [CHANGELOG.md](CHANGELOG.md). The changelog follows the [Keep a Changelog](https://keepachangelog.com/) format and is automatically updated based on conventional commit messages:

- `feat:` → Added
- `fix:` → Fixed
- `chore:`, `refactor:`, `style:` → Changed
- `security:` → Security

### Code Documentation

- Use JSDoc comments for functions and classes
- Keep inline comments focused on explaining "why" not "what"
- Update relevant documentation when making changes
- Add TypeScript types for all new code

### Component Documentation

- Create a README.md in each component folder
- Document props, state, and side effects
- Include usage examples
- Note any performance considerations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Commit Guidelines

- Use conventional commits format
- Reference issues in commit messages
- Keep commits focused and atomic
- Update CHANGELOG.md for notable changes

## License

[MIT License](LICENSE)

## Roadmap

- [ ] Phase 1: Project Setup and Basic Architecture ✅
- [ ] Phase 2: Screen Capture Implementation
- [ ] Phase 3: OpenAI Vision API Integration
- [ ] Phase 4: Voice Interaction
- [ ] Phase 5: Game Profiles
- [ ] Phase 6: Performance Optimization
