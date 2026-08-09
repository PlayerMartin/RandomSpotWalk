import { create } from "zustand";
import type { Walk } from "../types";
import { loadWalks, saveWalks } from "../utils/storage";

interface HistoryState {
  walks: Walk[];
  loaded: boolean;
  addWalk: (walk: Walk) => void;
  load: () => void;
  clear: () => void;
  completedCount: () => number;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  walks: [],
  loaded: false,

  addWalk: (walk) => {
    const walks = [walk, ...get().walks];
    set({ walks });
    saveWalks(walks);
  },

  load: () => {
    if (get().loaded) return;
    set({ walks: loadWalks(), loaded: true });
  },

  clear: () => {
    set({ walks: [] });
    saveWalks([]);
  },

  completedCount: () =>
    get().walks.filter((w) => w.status === "completed").length,
}));
