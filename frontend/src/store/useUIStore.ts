import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    theme: 'light' | 'dark';
    layoutMode: 'grid' | 'list';
    toggleTheme: () => void;
    setLayoutMode: (mode: 'grid' | 'list') => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: 'light',
            layoutMode: 'grid',
            toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
            setLayoutMode: (mode) => set({ layoutMode: mode }),
        }),
        {
            name: 'ui-storage',
        }
    )
);
