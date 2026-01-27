import { create } from 'zustand';

interface DataState {
  users: any[];
  notes: any[];
  links: any[];
  videos: any[];
  stats: any | null;
  categories: { note: any[]; website: any[]; video: any[] };
  fetched: {
    users: boolean;
    notes: boolean;
    links: boolean;
    videos: boolean;
    stats: boolean;
    categoriesNote: boolean;
    categoriesWebsite: boolean;
    categoriesVideo: boolean;
  };
  setUsers: (users: any[]) => void;
  setNotes: (notes: any[]) => void;
  setLinks: (links: any[]) => void;
  setVideos: (videos: any[]) => void;
  setStats: (stats: any) => void;
  setCategories: (type: 'note' | 'website' | 'video', categories: any[]) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  users: [],
  notes: [],
  links: [],
  videos: [],
  stats: null,
  categories: { note: [], website: [], video: [] },
  fetched: {
    users: false,
    notes: false,
    links: false,
    videos: false,
    stats: false,
    categoriesNote: false,
    categoriesWebsite: false,
    categoriesVideo: false,
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
  setVideos: (videos) => set((state) => ({ 
    videos, 
    fetched: { ...state.fetched, videos: true } 
  })),
  setStats: (stats) => set((state) => ({ 
    stats, 
    fetched: { ...state.fetched, stats: true } 
  })),
  setCategories: (type, categories) => set((state) => ({
    categories: { ...state.categories, [type]: categories },
    fetched: { 
      ...state.fetched, 
      categoriesNote: type === 'note' ? true : state.fetched.categoriesNote,
      categoriesWebsite: type === 'website' ? true : state.fetched.categoriesWebsite,
      categoriesVideo: type === 'video' ? true : state.fetched.categoriesVideo
    }
  })),
  clearData: () => set({
    users: [],
    notes: [],
    links: [],
    videos: [],
    stats: null,
    categories: { note: [], website: [], video: [] },
    fetched: {
      users: false,
      notes: false,
      links: false,
      videos: false,
      stats: false,
      categoriesNote: false,
      categoriesWebsite: false,
      categoriesVideo: false,
    },
  }),
}));
