import { create } from 'zustand';
import type { Achievement, AppPhase, Difficulty, LatLng, Walk } from '../types';
import { DIFFICULTY_THRESHOLDS } from '../types';
import { randomPointInCircle } from '../utils/geo';
import { clearActiveWalk, clearSetup, loadActiveWalk, loadSetup, saveActiveWalk, saveSetup } from '../utils/storage';
import { useHistoryStore } from './historyStore';
import { useGamificationStore } from './gamificationStore';

interface AppState {
  phase: AppPhase;
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  radiusKm: number;
  difficulty: Difficulty;
  timerSeconds: number | null;
  startedAt: string | null;
  completedWalk: Walk | null;
  newlyUnlocked: Achievement[];

  setStartPoint: (point: LatLng) => void;
  clearStartPoint: () => void;
  setRadius: (km: number) => void;
  setDifficulty: (d: Difficulty) => void;
  setTimer: (seconds: number | null) => void;
  generateDest: () => void;
  rerollDest: () => void;
  startWalk: () => void;
  completeWalk: () => void;
  cancelWalk: () => void;
  resetToSetup: () => void;
}

function buildWalkId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function elapsedSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
}

export const useAppStore = create<AppState>((set, get) => {
  // Restore an in-progress walk synchronously at store creation so a page
  // refresh / browser restart resumes straight into the walking screen
  // (no flash of the setup screen, and GPS/timer pick up where they left off).
  const active = loadActiveWalk();
  // When there's no in-progress walk, restore the setup draft so a refresh
  // mid-setup keeps the user's config (start point, dest, radius, difficulty,
  // countdown) intact.
  const draft = !active ? loadSetup() : null;

  return {
    phase: active ? 'walking' : 'setup',
    startPoint: active ? active.startPoint : draft?.startPoint ?? null,
    destPoint: active ? active.destPoint : draft?.destPoint ?? null,
    radiusKm: active ? active.radiusKm : draft?.radiusKm ?? 1,
    difficulty: active ? active.difficulty : draft?.difficulty ?? 'easy',
    timerSeconds: active ? active.timerSeconds : draft?.timerSeconds ?? null,
    startedAt: active ? active.startedAt : null,
    completedWalk: null,
    newlyUnlocked: [],

    setStartPoint: (point) => set({ startPoint: point, destPoint: null }),

    clearStartPoint: () => set({ startPoint: null, destPoint: null }),

    setRadius: (km) => {
      set({ radiusKm: km, destPoint: null });
    },

    setDifficulty: (d) => set({ difficulty: d }),

    setTimer: (seconds) => set({ timerSeconds: seconds }),

    generateDest: () => {
      const { startPoint, radiusKm } = get();
      if (!startPoint) return;
      set({ destPoint: randomPointInCircle(startPoint, radiusKm) });
    },

    rerollDest: () => {
      get().generateDest();
    },

    startWalk: () => {
      const { startPoint, destPoint, radiusKm, difficulty, timerSeconds } = get();
      if (!startPoint || !destPoint) return;
      const startedAt = new Date().toISOString();
      set({ phase: 'walking', startedAt });

      // The setup draft has been consumed — drop it so we don't resurrect
      // stale config when the walk finishes and returns to setup.
      clearSetup();

      // Persist so a refresh/restart can resume this walk.
      saveActiveWalk({
        startPoint,
        destPoint,
        radiusKm,
        difficulty,
        timerSeconds,
        startedAt,
      });
    },

    completeWalk: () => {
      if (get().phase !== 'walking') return; // idempotency guard
      const s = get();
      if (!s.startedAt || !s.startPoint || !s.destPoint) return;
      const walk: Walk = {
        id: buildWalkId(),
        startedAt: s.startedAt,
        completedAt: new Date().toISOString(),
        startPoint: s.startPoint,
        destinationPoint: s.destPoint,
        radiusKm: s.radiusKm,
        difficulty: s.difficulty,
        thresholdMeters: DIFFICULTY_THRESHOLDS[s.difficulty],
        timerSetSeconds: s.timerSeconds,
        elapsedSeconds: elapsedSince(s.startedAt),
        status: 'completed',
      };

      clearActiveWalk();
      useHistoryStore.getState().addWalk(walk);
      const newest = useGamificationStore.getState().processWalkCompletion(walk);

      set({
        phase: 'completed',
        completedWalk: walk,
        newlyUnlocked: newest,
      });
    },

    cancelWalk: () => {
      if (get().phase !== 'walking') return; // idempotency guard
      const s = get();
      if (!s.startedAt || !s.startPoint || !s.destPoint) return;
      const walk: Walk = {
        id: buildWalkId(),
        startedAt: s.startedAt,
        completedAt: new Date().toISOString(),
        startPoint: s.startPoint,
        destinationPoint: s.destPoint,
        radiusKm: s.radiusKm,
        difficulty: s.difficulty,
        thresholdMeters: DIFFICULTY_THRESHOLDS[s.difficulty],
        timerSetSeconds: s.timerSeconds,
        elapsedSeconds: elapsedSince(s.startedAt),
        status: 'cancelled',
      };

      clearActiveWalk();
      useHistoryStore.getState().addWalk(walk);
      set({ phase: 'setup', completedWalk: null, newlyUnlocked: [] });
    },

    resetToSetup: () => {
      clearActiveWalk();
      set({
        phase: 'setup',
        startedAt: null,
        completedWalk: null,
        newlyUnlocked: [],
        destPoint: null,
      });
    },
  };
});

// Persist the setup draft whenever the setup screen changes, so a page
// refresh / browser restart mid-setup keeps the user's config (start point,
// generated destination, radius, difficulty, countdown) intact. Skipped outside
// the setup phase — an in-progress walk is covered by the active-walk record.
useAppStore.subscribe((state) => {
  if (state.phase !== 'setup') return;
  saveSetup({
    startPoint: state.startPoint,
    destPoint: state.destPoint,
    radiusKm: state.radiusKm,
    difficulty: state.difficulty,
    timerSeconds: state.timerSeconds,
  });
});
