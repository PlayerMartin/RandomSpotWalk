import { create } from "zustand";

type PanelId = "history" | "gamification" | null;

interface UiState {
  panel: PanelId;
  openPanel: (id: Exclude<PanelId, null>) => void;
  closePanel: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  panel: null,
  openPanel: (id) => set({ panel: id }),
  closePanel: () => set({ panel: null }),
}));
