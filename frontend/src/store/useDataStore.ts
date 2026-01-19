import { create } from 'zustand';

interface DataState {
  users: any[];
  notes: any[];
  links: any[];
  stats: any | null;
  categories: { note: any[]; website: any[] };
  fetched: {
    users: boolean;
    notes: boolean;
    links: boolean;
    stats: boolean;
    categories: boolean;
  };
  setUsers: (users: any[]) => void;
  setNotes: (notes: any[]) => void;
  setLinks: (links: any[]) => void;
  setStats: (stats: any) => void;
  setCategories: (type: 'note' | 'website', categories: any[]) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  users: [],
  notes: [],
  links: [],
  stats: null,
  categories: { note: [], website: [] },
  fetched: {
    users: false,
    notes: false,
    links: false,
    stats: false,
    categories: false,
  },
  setUsers: (users) => set((state) => ({ 
    users, 
    fetched: { ...state.fetched, users: true } 
  })),
  setNotes: (notes) => set((state) => ({ 
    notes, 
    fetched: { ...state.fetched, notes: true } 
  })),
  setLinks: (links) => set((state) => ({ 
    links, 
    fetched: { ...state.fetched, links: true } 
  })),
  setStats: (stats) => set((state) => ({ 
    stats, 
    fetched: { ...state.fetched, stats: true } 
  })),
  setCategories: (type, categories) => set((state) => ({
    categories: { ...state.categories, [type]: categories },
    fetched: { ...state.fetched, categories: true }
  })),
  clearData: () => set({
    users: [],
    notes: [],
    links: [],
    stats: null,
    categories: { note: [], website: [] },
    fetched: {
      users: false,
      notes: false,
      links: false,
      stats: false,
      categories: false,
    },
  }),
}));
