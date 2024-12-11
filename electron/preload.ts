import { contextBridge, ipcRenderer } from 'electron';
import type {
  ElectronAPI,
  ValidChannel,
  ChannelData,
  AIAnalysisRequest
} from './types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const api: ElectronAPI = {
  // Event Listeners
  on<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void) {
    return ipcRenderer.on(channel, (_, data) => callback(data));
  },
  off<T extends ValidChannel>(channel: T, callback: (data: ChannelData<T>) => void) {
    return ipcRenderer.removeListener(channel, (_, data) => callback(data));
  },
  removeAllListeners(channel: ValidChannel) {
    return ipcRenderer.removeAllListeners(channel);
  },
  setMaxListeners(n: number) {
    return ipcRenderer.setMaxListeners(n);
  },

  // Screenshot Management
  updateConfig: (config) => ipcRenderer.invoke('update-screenshot-config', config),
  getConfig: () => ipcRenderer.invoke('get-screenshot-config'),
  captureNow: () => ipcRenderer.invoke('capture-now'),
  listDisplays: () => ipcRenderer.invoke('list-displays'),
  startCapture: () => ipcRenderer.invoke('start-capture'),
  stopCapture: () => ipcRenderer.invoke('stop-capture'),

  // Hotkey Management
  updateHotkey: (action, accelerator) => ipcRenderer.invoke('update-hotkey', action, accelerator),
  getHotkeys: () => ipcRenderer.invoke('get-hotkeys'),
  setHotkeyMode: (enabled) => ipcRenderer.invoke('set-hotkey-mode', enabled),
  getHotkeyMode: () => ipcRenderer.invoke('get-hotkey-mode'),

  // AI Analysis
  analyzeImage: (request: AIAnalysisRequest) => {
    return ipcRenderer.invoke('ai:analyze-image', request);
  }
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

