import { create } from 'zustand';
import type { MapTheme } from '../types';
import { loadMapTheme, saveMapTheme } from '../utils/storage';

interface SettingsState {
  mapTheme: MapTheme;
  loaded: boolean;
  toggleTheme: () => void;
  load: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  mapTheme: 'light',
  loaded: false,

  toggleTheme: () => {
    const next: MapTheme = get().mapTheme === 'light' ? 'dark' : 'light';
    set({ mapTheme: next });
    saveMapTheme(next);
  },

  load: () => {
    if (get().loaded) return;
    set({ mapTheme: loadMapTheme(), loaded: true });
  },
}));
