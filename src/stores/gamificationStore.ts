import { create } from 'zustand';
import type { GamificationState, Walk } from '../types';
import { checkNewAchievements } from '../utils/achievements';
import { freshGamification, loadGamification, saveGamification } from '../utils/storage';
import { useHistoryStore } from './historyStore';

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isYesterday(isoDateStr: string, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isoDateStr === toDateStr(yesterday);
}

interface GamificationStore extends GamificationState {
  loaded: boolean;
  load: () => void;
  processWalkCompletion: (walk: Walk) => GamificationState['achievements'];
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  ...freshGamification(),
  loaded: false,

  load: () => {
    if (get().loaded) return;
    set({ ...loadGamification(), loaded: true });
  },

  processWalkCompletion: (walk) => {
    const state = get();
    const today = new Date();
    const todayStr = toDateStr(today);

    // Compute new streak
    let { currentStreak } = state;
    if (state.lastWalkDate === todayStr) {
      // walked today already — no change
    } else if (state.lastWalkDate !== null && isYesterday(state.lastWalkDate, today)) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const bestStreak = Math.max(state.bestStreak, currentStreak);

    const totalWalks = useHistoryStore.getState().completedCount();

    const newUnlocks = checkNewAchievements(
      state.achievements,
      totalWalks,
      walk,
      currentStreak,
    );

    const achievements = state.achievements.map((a) => {
      const unlocked = newUnlocks.find((n) => n.id === a.id);
      return unlocked ?? a;
    });

    const next: GamificationState = {
      currentStreak,
      bestStreak,
      lastWalkDate: todayStr,
      achievements,
    };

    set(next);
    saveGamification(next);
    return newUnlocks;
  },
}));
