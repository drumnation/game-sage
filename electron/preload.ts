import { contextBridge, ipcRenderer } from 'electron';
import type {
  GameEvent,
  CaptureFrame,
  MessagePayload,
  ElectronAPI,
  CaptureError,
  APIResponse,
  CaptureResult,
  DisplayInfo,
} from './types';
import type { ScreenshotConfig } from '../electron/services/screenshot/types';
import type { ShortcutConfig } from '../electron/services/shortcuts/types';

type ChannelTypeMap = {
  'capture-frame': CaptureFrame | CaptureError;
  'game-event': GameEvent;
  'main-process-message': MessagePayload;
  'capture-hotkey': void;
  'shortcut-action': {
    action: keyof ShortcutConfig;
    success: boolean;
    error?: string;
    data?: unknown;
  };
};

const validChannels: (keyof ChannelTypeMap)[] = [
  'capture-frame',
  'game-event',
  'main-process-message',
  'capture-hotkey',
  'shortcut-action'
];

const isValidChannel = (channel: string): channel is keyof ChannelTypeMap => {
  return validChannels.includes(channel as keyof ChannelTypeMap);
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: ElectronAPI = {
  // Event Listeners
  on: (channel: string, callback: (data: CaptureFrame | CaptureError) => void) => {
    if (isValidChannel(channel)) {
      ipcRenderer.on(channel, (_event, data) => callback(data));
    }
  },
  off: (channel: string, callback: (data: CaptureFrame | CaptureError) => void) => {
    if (isValidChannel(channel)) {
      ipcRenderer.removeListener(channel, (_event, data) => callback(data));
    }
  },

  // Screenshot Management
  updateConfig: (config: Partial<ScreenshotConfig>) =>
    ipcRenderer.invoke('update-screenshot-config', config) as Promise<APIResponse<void>>,
  getConfig: () =>
    ipcRenderer.invoke('get-screenshot-config') as Promise<APIResponse<ScreenshotConfig>>,
  captureNow: () =>
    ipcRenderer.invoke('capture-now') as Promise<APIResponse<CaptureResult[]>>,
  listDisplays: () =>
    ipcRenderer.invoke('list-displays') as Promise<APIResponse<DisplayInfo[]>>,
  getHotkeys: () =>
    ipcRenderer.invoke('get-hotkeys') as Promise<APIResponse<{ [key: string]: string }>>,
  updateHotkey: (action: string, accelerator: string) =>
    ipcRenderer.invoke('update-hotkey', action, accelerator) as Promise<APIResponse<void>>,
};

// Expose the electron object with hotkey event handlers
const electron = {
  onHotkeyPress: (callback: () => void) => {
    ipcRenderer.on('hotkey-press', () => callback());
  },
  onHotkeyRelease: (callback: () => void) => {
    ipcRenderer.on('hotkey-release', () => callback());
  },
  removeHotkeyPress: (callback: () => void) => {
    ipcRenderer.removeListener('hotkey-press', callback);
  },
  removeHotkeyRelease: (callback: () => void) => {
    ipcRenderer.removeListener('hotkey-release', callback);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
contextBridge.exposeInMainWorld('electron', electron);
