import { createContext, useContext } from 'react';
import type { ElectronAPI } from '@electron/types';

export interface ElectronContextType {
    api: ElectronAPI;
}

const ElectronContext = createContext<ElectronContextType | null>(null);

export const useElectron = () => {
    const context = useContext(ElectronContext);
    if (!context) {
        throw new Error('useElectron must be used within an ElectronProvider');
    }
    return context;
};

export const ElectronProvider = ElectronContext.Provider;
export default ElectronContext; 