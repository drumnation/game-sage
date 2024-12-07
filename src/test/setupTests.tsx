import '@testing-library/jest-dom';
import { Buffer } from 'buffer';
import { mockElectronAPI } from './helpers/mockElectron';
import React from 'react';
import type { ButtonProps, AlertProps } from 'antd';

// Mock window.electron
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
});

// Mock Ant Design Button
jest.mock('antd', () => ({
  Button: React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, loading, onClick, disabled, htmlType, ...props }, ref) => {
      const isLoading = loading === true || (typeof loading === 'object' && loading.delay !== undefined);
      const buttonType = htmlType === 'submit' || htmlType === 'reset' || htmlType === 'button' ? htmlType : 'button';
      return (
        <button
          ref={ref}
          onClick={onClick}
          disabled={disabled || isLoading}
          data-loading={isLoading.toString()}
          // @ts-expect-error - TypeScript doesn't know about the htmlType prop
          type={buttonType as "button" | "submit" | "reset" | undefined}
          {...props}
        >
          {children}
        </button>
      );
    }
  ),
  Alert: ({ message, description, type }: AlertProps) => (
    <div role="alert" data-type={type}>
      {message && <div data-testid="alert-message">{message}</div>}
      {description && <div data-testid="alert-description">{description}</div>}
    </div>
  )
}));

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

// Mock screenshot-desktop module
jest.mock('screenshot-desktop', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => Promise.resolve(Buffer.from('mock-screenshot-data')))
}));

// Mock electron screen API
jest.mock('electron', () => ({
  screen: {
    getAllDisplays: jest.fn().mockReturnValue([
      {
        id: 1,
        label: 'Display 1',
        bounds: { x: 0, y: 0, width: 1920, height: 1080 }
      }
    ]),
    getPrimaryDisplay: jest.fn().mockReturnValue({ id: 1 })
  }
}));

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