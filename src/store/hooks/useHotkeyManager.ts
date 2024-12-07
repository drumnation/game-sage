import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    setHotkeyPressed,
    setCaptureHotkey,
    setIsRecordingHotkey,
    setPressedKeys,
    selectCaptureHotkey,
    selectIsRecordingHotkey,
    selectPressedKeys,
} from '../slices/hotkeySlice';
import type { ElectronAPI, APIResponse } from '../../../electron/types/electron-api';

export const useHotkeyManager = () => {
    const dispatch = useAppDispatch();
    const captureHotkey = useAppSelector(selectCaptureHotkey);
    const isRecordingHotkey = useAppSelector(selectIsRecordingHotkey);
    const pressedKeys = useAppSelector(selectPressedKeys);

    const preventDefault = useCallback((e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }, []);

    const updateHotkey = useCallback((newHotkey: string) => {
        const api = window.electronAPI;
        if (!api) return;

        // Update UI immediately
        dispatch(setCaptureHotkey(newHotkey));

        // Save to localStorage
        localStorage.setItem('captureHotkey', newHotkey);

        // Update in main process
        api.updateHotkey('captureNow', newHotkey)
            .then((response: APIResponse<void>) => {
                if (!response.success) {
                    console.error('Failed to update hotkey');
                    dispatch(setCaptureHotkey('CommandOrControl+Shift+C'));
                    localStorage.setItem('captureHotkey', 'CommandOrControl+Shift+C');
                }
            })
            .catch((error: Error) => {
                console.error('Error updating hotkey:', error);
                dispatch(setCaptureHotkey('CommandOrControl+Shift+C'));
                localStorage.setItem('captureHotkey', 'CommandOrControl+Shift+C');
            });
    }, [dispatch]);

    const startRecording = useCallback(() => {
        dispatch(setIsRecordingHotkey(true));
        dispatch(setPressedKeys([]));
    }, [dispatch]);

    const stopRecording = useCallback(() => {
        dispatch(setIsRecordingHotkey(false));
        dispatch(setPressedKeys([]));
    }, [dispatch]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isRecordingHotkey) return;

        // Stop event propagation immediately
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const key = e.key.toLowerCase();
        if (key === 'escape') {
            stopRecording();
            return;
        }

        const newKeys: string[] = [];

        // Add modifier keys
        if (e.metaKey) newKeys.push('CommandOrControl');
        if (e.ctrlKey && !e.metaKey) newKeys.push('CommandOrControl');
        if (e.altKey) newKeys.push('Alt');
        if (e.shiftKey) newKeys.push('Shift');

        // Add the main key if it's not a modifier
        if (!['meta', 'control', 'alt', 'shift'].includes(key)) {
            // Convert key codes to Electron format
            const keyCode = e.code.replace('Key', '').toUpperCase();
            newKeys.push(keyCode);
        }

        dispatch(setPressedKeys(newKeys));

        // If we have at least one modifier and one regular key
        if (newKeys.length >= 2 && !newKeys.every(k => ['CommandOrControl', 'Alt', 'Shift'].includes(k))) {
            const hotkeyString = newKeys.join('+');
            updateHotkey(hotkeyString);
            stopRecording();
        }
    }, [isRecordingHotkey, dispatch, updateHotkey, stopRecording]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (!isRecordingHotkey) return;

        // Stop event propagation immediately
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const key = e.key.toLowerCase();
        const currentKeys = [...pressedKeys];

        // Remove the corresponding key
        if (key === 'meta' || key === 'control') {
            const index = currentKeys.indexOf('CommandOrControl');
            if (index !== -1) {
                currentKeys.splice(index, 1);
            }
        } else if (key === 'alt') {
            const index = currentKeys.indexOf('Alt');
            if (index !== -1) {
                currentKeys.splice(index, 1);
            }
        } else if (key === 'shift') {
            const index = currentKeys.indexOf('Shift');
            if (index !== -1) {
                currentKeys.splice(index, 1);
            }
        } else {
            const keyCode = e.code.replace('Key', '').toUpperCase();
            const index = currentKeys.indexOf(keyCode);
            if (index !== -1) {
                currentKeys.splice(index, 1);
            }
        }

        // If all keys are released, close the modal
        if (currentKeys.length === 0) {
            stopRecording();
        } else {
            dispatch(setPressedKeys(currentKeys));
        }
    }, [isRecordingHotkey, pressedKeys, dispatch, stopRecording]);

    // Set up key event listeners when recording starts
    useEffect(() => {
        if (isRecordingHotkey) {
            window.addEventListener('keydown', handleKeyDown, { capture: true });
            window.addEventListener('keyup', handleKeyUp, { capture: true });
            document.addEventListener('keydown', preventDefault, { capture: true });
            document.addEventListener('keyup', preventDefault, { capture: true });

            return () => {
                window.removeEventListener('keydown', handleKeyDown, { capture: true });
                window.removeEventListener('keyup', handleKeyUp, { capture: true });
                document.removeEventListener('keydown', preventDefault, { capture: true });
                document.removeEventListener('keyup', preventDefault, { capture: true });
            };
        }
    }, [isRecordingHotkey, handleKeyDown, handleKeyUp, preventDefault]);

    // Load initial hotkey config
    useEffect(() => {
        const api = window.electronAPI as ElectronAPI | undefined;
        if (!api) return;

        api.getHotkeys()
            .then((response: APIResponse<{ [key: string]: string }>) => {
                if (response.success && response.data?.captureNow) {
                    dispatch(setCaptureHotkey(response.data.captureNow));
                }
            });
    }, [dispatch]);

    // Set up hotkey press/release listeners
    useEffect(() => {
        if (!window.electron) return;

        const handleHotkeyPress = () => {
            dispatch(setHotkeyPressed(true));
        };

        const handleHotkeyRelease = () => {
            dispatch(setHotkeyPressed(false));
        };

        window.electron.onHotkeyPress(handleHotkeyPress);
        window.electron.onHotkeyRelease(handleHotkeyRelease);

        return () => {
            if (window.electron) {
                window.electron.removeHotkeyPress(handleHotkeyPress);
                window.electron.removeHotkeyRelease(handleHotkeyRelease);
            }
        };
    }, [dispatch]);

    return {
        captureHotkey,
        isRecordingHotkey,
        pressedKeys,
        startRecording,
        stopRecording,
        updateHotkey
    };
}; 