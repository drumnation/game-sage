import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../types';

const DEFAULT_HOTKEY = 'CommandOrControl+Shift+C';

export interface HotkeyState {
    isPressed: boolean;
    captureHotkey: string;
    isRecordingHotkey: boolean;
    pressedKeys: string[];
}

const initialState: HotkeyState = {
    isPressed: false,
    captureHotkey: DEFAULT_HOTKEY,
    isRecordingHotkey: false,
    pressedKeys: [],
};

const hotkeySlice = createSlice({
    name: 'hotkey',
    initialState,
    reducers: {
        setHotkeyPressed: (state, action: PayloadAction<boolean>) => {
            state.isPressed = action.payload;
        },
        setCaptureHotkey: (state, action: PayloadAction<string>) => {
            state.captureHotkey = action.payload;
        },
        setIsRecordingHotkey: (state, action: PayloadAction<boolean>) => {
            state.isRecordingHotkey = action.payload;
        },
        setPressedKeys: (state, action: PayloadAction<string[]>) => {
            state.pressedKeys = action.payload;
        },
    },
});

// Actions
export const {
    setHotkeyPressed,
    setCaptureHotkey,
    setIsRecordingHotkey,
    setPressedKeys,
} = hotkeySlice.actions;

// Selectors
export const selectHotkeyPressed = (state: RootState) => state.hotkey.isPressed;
export const selectCaptureHotkey = (state: RootState) => state.hotkey.captureHotkey;
export const selectIsRecordingHotkey = (state: RootState) => state.hotkey.isRecordingHotkey;
export const selectPressedKeys = (state: RootState) => state.hotkey.pressedKeys;

export default hotkeySlice.reducer; 