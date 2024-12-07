import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type {
  ValidChannel,
  ChannelCallback,
  GameEvent,
  CaptureFrame,
  MessagePayload,
} from './types';
import type { ScreenshotConfig } from '../electron/services/screenshot/types';
import type { ShortcutConfig } from '../electron/services/shortcuts/types';
import type { HotkeyConfig } from '../electron/services/hotkey/types';

type ChannelTypeMap = {
  'capture-frame': CaptureFrame;
  'game-event': GameEvent;
  'main-process-message': MessagePayload;
  'shortcut-action': {
    action: keyof ShortcutConfig;
    success: boolean;
    error?: string;
    data?: unknown;
  };
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // System
  ping: () => ipcRenderer.invoke('ping'),

  // App State
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),

  // Screenshot Management
  startCapture: () => ipcRenderer.invoke('start-capture'),
  stopCapture: () => ipcRenderer.invoke('stop-capture'),
  captureNow: () => ipcRenderer.invoke('capture-now'),
  updateConfig: (config: Partial<ScreenshotConfig>) =>
    ipcRenderer.invoke('update-screenshot-config', config),
  getConfig: () => ipcRenderer.invoke('get-screenshot-config'),
  listDisplays: () => ipcRenderer.invoke('list-displays'),

  // Event Management
  setMaxListeners: (n: number) => {
    ipcRenderer.setMaxListeners(n);
  },
  removeAllListeners: (channel: ValidChannel) => {
    if (['capture-frame', 'game-event', 'main-process-message', 'shortcut-action'].includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // Shortcuts Management
  updateShortcuts: (config: Partial<ShortcutConfig>) =>
    ipcRenderer.invoke('update-shortcuts', config),

  // Hotkey management
  updateHotkey: async (action: keyof HotkeyConfig, accelerator: string) => {
    return await ipcRenderer.invoke('update-hotkey', action, accelerator);
  },

  getHotkeys: async () => {
    return await ipcRenderer.invoke('get-hotkeys');
  },

  // Utility
  on: <T extends ValidChannel>(channel: T, callback: ChannelCallback<ChannelTypeMap[T]>) => {
    if (['capture-frame', 'game-event', 'main-process-message', 'shortcut-action'].includes(channel)) {
      ipcRenderer.on(channel, (_event: IpcRendererEvent, data: ChannelTypeMap[T]) => callback(data));
    }
  },

  off: <T extends ValidChannel>(channel: T, callback: ChannelCallback<ChannelTypeMap[T]>) => {
    if (['capture-frame', 'game-event', 'main-process-message', 'shortcut-action'].includes(channel)) {
      ipcRenderer.removeListener(channel, (_event: IpcRendererEvent, data: ChannelTypeMap[T]) => callback(data));
    }
  },
});
