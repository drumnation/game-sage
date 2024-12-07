# Changelog

All notable changes to this project will be documented in this file.

## [0.3.3] - 2024-03-07

### Added

- New screenshot settings UI component
- Hotkey management system
- Global hotkey hooks and store integration

### Changed

- Enhanced screenshot service with improved type safety
- Updated electron main and preload scripts for better type definitions
- Improved monitor selection component
- Enhanced screenshot controls with new settings integration

### Fixed

- Type definitions in electron API
- Screenshot capture workflow
- Left sidebar styling improvements

## [0.3.2] - 2024-03-07

### Fixed

- Fixed store exports to prevent hook ambiguity
- Fixed module resolution for styled-components
- Improved state synchronization between settings.mode and currentMode
- Enhanced responses array handling in AI analysis
- Fixed GameAnalysis component imports

## [0.3.1] - 2024-03-07

### Fixed

- Fixed TypeScript errors in AIService tests
- Improved type safety by removing usage of 'any' type
- Updated prompt template types to use ComposedPrompt interface
- Fixed action payload type in useAI hook

## [0.3.0] - 2024-01-XX

### Changed

- Updated OpenAI Vision API integration to use latest gpt-4o-mini model
- Simplified message structure for better API compatibility
- Improved conversation context handling in prompts
- Enhanced error handling for API responses

## [0.2.0] - 2024-01-XX

### Added

- OpenAI Vision API Integration
  - Implemented GPT-4 Vision API for real-time gameplay analysis
  - Added secure API key management
  - Created type-safe API response handling

- Prompt Management System
  - Added support for multiple analysis modes (tactical, commentary, e-sports)
  - Implemented dynamic prompt templates with game-specific customization
  - Created conversation context management for continuous analysis

- Error Handling & Recovery
  - Added comprehensive error handling for API failures
  - Implemented automatic retry mechanisms for transient errors
  - Added error reporting and user feedback

- State Management
  - Integrated Redux Toolkit for AI response management
  - Added conversation history tracking
  - Implemented game-specific state persistence

### Changed

- Refactored screenshot analysis pipeline to support AI integration
- Updated testing framework to support API mocking
- Enhanced type system for better API integration

### Fixed

- Improved error handling for API timeouts and failures
- Fixed memory leaks in long-running analysis sessions
- Resolved race conditions in concurrent API calls

## [0.1.0] - 2024-01-15

### Added

- Initial release
- Basic screenshot capture functionality
- Real-time preview of captured screenshots
- Configurable capture intervals
- Basic UI with Ant Design components
- Electron IPC communication setup
- Project structure and development environment
