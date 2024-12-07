import '@testing-library/jest-dom';
import type { ElectronAPI } from '../../electron/types/electron-api';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Mock Electron context
const mockElectronAPI: ElectronAPI = {
  on: jest.fn(),
  off: jest.fn(),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getConfig: jest.fn().mockResolvedValue({
    captureInterval: 1000,
    width: 1920,
    height: 1080,
    format: 'jpeg'
  })
};

// Mock window.electron
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: ResizeObserverCallback) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(_target: Element, _options?: ResizeObserverOptions) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(_target: Element) { }
  disconnect() { }
}

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(_target: Element) { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(_target: Element) { }
  disconnect() { }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

global.ResizeObserver = MockResizeObserver;
global.IntersectionObserver = MockIntersectionObserver;

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: React.createFactory()'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 