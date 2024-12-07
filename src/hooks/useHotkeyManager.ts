import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCaptureHotkey,
    setIsRecordingHotkey,
    setPressedKeys,
    selectCaptureHotkey,
    selectIsRecordingHotkey,
    selectPressedKeys,
} from '../store/slices/hotkeySlice';
import type { APIResponse } from '@electron/types';

export const useHotkeyManager = () => {
    const dispatch = useDispatch();
    const captureHotkey = useSelector(selectCaptureHotkey);
    const isRecordingHotkey = useSelector(selectIsRecordingHotkey);
    const pressedKeys = useSelector(selectPressedKeys);

    const preventDefault = useCallback((e: Event) => {
        if (isRecordingHotkey) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }, [isRecordingHotkey]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isRecordingHotkey) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const key = e.key.toLowerCase();
        if (key === 'escape') {
            dispatch(setIsRecordingHotkey(false));
            return;
        }

        const newPressedKeys = new Set<string>(pressedKeys);

        // Add modifier keys
        if (e.metaKey) newPressedKeys.add('CommandOrControl');
        if (e.ctrlKey && !e.metaKey) newPressedKeys.add('CommandOrControl');
        if (e.altKey) newPressedKeys.add('Alt');
        if (e.shiftKey) newPressedKeys.add('Shift');

        // Add the main key if it's not a modifier
        if (!['meta', 'control', 'alt', 'shift'].includes(key)) {
            const keyCode = e.code.replace('Key', '').toUpperCase();
            newPressedKeys.add(keyCode);
        }

        // If we have at least one modifier and one regular key
        const pressedKeysArray = Array.from(newPressedKeys);
        if (pressedKeysArray.length >= 2 && !pressedKeysArray.every(k => ['CommandOrControl', 'Alt', 'Shift'].includes(k))) {
            const hotkeyString = pressedKeysArray.join('+');
            updateHotkey(hotkeyString);
            dispatch(setIsRecordingHotkey(false));
        } else {
            dispatch(setPressedKeys(pressedKeysArray));
        }
    }, [dispatch, isRecordingHotkey, pressedKeys]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (!isRecordingHotkey) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const key = e.key.toLowerCase();
        const newPressedKeys = new Set<string>(pressedKeys);

        if (key === 'meta' || key === 'control') {
            newPressedKeys.delete('CommandOrControl');
        } else if (key === 'alt') {
            newPressedKeys.delete('Alt');
        } else if (key === 'shift') {
            newPressedKeys.delete('Shift');
        } else {
            const keyCode = e.code.replace('Key', '').toUpperCase();
            newPressedKeys.delete(keyCode);
        }

        dispatch(setPressedKeys(Array.from(newPressedKeys)));
    }, [dispatch, isRecordingHotkey, pressedKeys]);

    const updateHotkey = useCallback(async (newHotkey: string) => {
        const api = window.electronAPI;
        if (!api || !('updateHotkey' in api)) return;

        dispatch(setCaptureHotkey(newHotkey));

        try {
            const response = await (api.updateHotkey as (action: string, accelerator: string) => Promise<APIResponse<void>>)('captureNow', newHotkey);
            if (!response.success) {
                console.error('Failed to update hotkey');
                dispatch(setCaptureHotkey('CommandOrControl+Shift+C'));
            }
        } catch (error) {
            console.error('Error updating hotkey:', error);
            dispatch(setCaptureHotkey('CommandOrControl+Shift+C'));
        }
    }, [dispatch]);

    // Set up global hotkey listeners
    useEffect(() => {
        if (isRecordingHotkey) {
            window.addEventListener('keydown', handleKeyDown, { capture: true });
            window.addEventListener('keyup', handleKeyUp, { capture: true });
            document.addEventListener('keydown', preventDefault, { capture: true });
            document.addEventListener('keyup', preventDefault, { capture: true });
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
            document.removeEventListener('keydown', preventDefault, { capture: true });
            document.removeEventListener('keyup', preventDefault, { capture: true });
        };
    }, [isRecordingHotkey, handleKeyDown, handleKeyUp, preventDefault]);

    // Load initial hotkey config
    useEffect(() => {
        const api = window.electronAPI;
        if (!api || !('getHotkeys' in api)) return;

        (api.getHotkeys as () => Promise<APIResponse<{ [key: string]: string }>>)().then(response => {
            if (response.success && response.data?.captureNow) {
                dispatch(setCaptureHotkey(response.data.captureNow));
            }
        });
    }, [dispatch]);

    return {
        captureHotkey,
        isRecordingHotkey,
        pressedKeys,
        startRecording: () => dispatch(setIsRecordingHotkey(true)),
        stopRecording: () => dispatch(setIsRecordingHotkey(false)),
        updateHotkey,
    };
}; 