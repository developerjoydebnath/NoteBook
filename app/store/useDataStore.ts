import { create } from 'zustand';

interface DataState {
  notes: any[];
  links: any[];
  stats: any | null;
  categories: { note: any[]; website: any[] };
  setNotes: (notes: any[]) => void;
  setLinks: (links: any[]) => void;
  setStats: (stats: any) => void;
  setCategories: (type: 'note' | 'website', categories: any[]) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  notes: [],
  links: [],
  stats: null,
  categories: { note: [], website: [] },
  setNotes: (notes) => set({ notes }),
  setLinks: (links) => set({ links }),
  setStats: (stats) => set({ stats }),
  setCategories: (type, categories) => set((state) => ({
    categories: { ...state.categories, [type]: categories }
  })),
  clearData: () => set({
    notes: [],
    links: [],
    stats: null,
    categories: { note: [], website: [] },
  }),
}));
