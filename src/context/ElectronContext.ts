import { createContext, useContext } from 'react';
import type { ElectronAPI } from '../../electron/types/electron-api';

export const ElectronContext = createContext<ElectronAPI | null>(null);

export const useElectron = () => {
    const context = useContext(ElectronContext);
    if (!context) {
        throw new Error('useElectron must be used within an ElectronProvider');
    }
    return context;
}; 