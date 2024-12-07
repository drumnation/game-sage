# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-01-20

### Added

- Comprehensive test suite for core functionality
  - Unit tests for ScreenshotService and StorageService
  - Component tests for ScreenshotManager
  - Integration tests for Electron IPC communication
- Test fixtures and utilities
  - Test image generation script
  - Mock implementations for Electron IPC
  - Custom test utilities for React components
- Performance and memory management tests
- Scene change detection with configurable thresholds
- Error handling and recovery mechanisms

### Fixed

- Memory leaks in screenshot capture process
- Proper cleanup of resources on component unmount
- Type safety issues in IPC communication
- Linter errors and code style consistency

### Changed

- Improved test organization and structure
- Enhanced error messaging and user feedback
- Optimized screenshot capture performance
- Updated component documentation

## [0.1.0] - 2024-01-15

### Added

- Initial release
- Basic screenshot capture functionality
- Real-time preview of captured screenshots
- Configurable capture intervals
- Basic UI with Ant Design components
- Electron IPC communication setup
- Project structure and development environment
