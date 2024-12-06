import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  isCapturing: boolean;
}

const initialState: AppState = {
  isCapturing: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    startCapture: (state) => {
      state.isCapturing = true;
    },
    stopCapture: (state) => {
      state.isCapturing = false;
    },
  },
});

export const { startCapture, stopCapture } = appSlice.actions;
export default appSlice.reducer; 