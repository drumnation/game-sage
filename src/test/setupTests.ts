import '@testing-library/jest-dom';
import type { ElectronAPI } from '../../electron/types';

// Create a type-safe mock implementation
const mockElectronAPI = {
  ping: jest.fn().mockResolvedValue('pong'),
  minimize: jest.fn(),
  maximize: jest.fn(),
  close: jest.fn(),
  startCapture: jest.fn().mockResolvedValue(undefined),
  stopCapture: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  off: jest.fn(),
} as unknown as ElectronAPI;

// Override the window.electronAPI type
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Safely redefine the electronAPI property
Object.defineProperty(window, 'electronAPI', {
  configurable: true,
  writable: true,
  value: mockElectronAPI
}); 