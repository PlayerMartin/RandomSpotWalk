// ── Coordinates ──
export interface LatLng {
  lat: number;
  lng: number;
}

// ── Difficulty ──
export type Difficulty = 'easy' | 'medium' | 'hard';

// Thresholds in meters (how close you must get to "win")
export const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = {
  easy: 100, // meters
  medium: 50,
  hard: 10,
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

// ── App Phase ──
export type AppPhase = 'setup' | 'walking' | 'completed';

// ── Walk ──
export interface Walk {
  id: string;
  startedAt: string; // ISO timestamp
  completedAt: string;
  startPoint: LatLng;
  destinationPoint: LatLng;
  radiusKm: number;
  difficulty: Difficulty;
  thresholdMeters: number;
  timerSetSeconds: number | null;
  elapsedSeconds: number;
  status: 'completed' | 'cancelled';
}

// ── Gamification ──
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string | null; // null = not yet unlocked
}

export interface GamificationState {
  currentStreak: number;
  bestStreak: number;
  lastWalkDate: string | null; // YYYY-MM-DD
  achievements: Achievement[];
}

// ── Map Theme ──
export type MapTheme = 'light' | 'dark';

// Last map viewport, persisted so it can be restored on launch.
export interface MapViewState {
  center: LatLng;
  zoom: number;
}

// ── Active (in-progress) Walk ──
// Subset of app state to resume a walk after a refresh; elapsed is recomputed
// from `startedAt` so it stays accurate. Persisted under `random-spot-walk-active`.
// See docs/technical/storage.md.
export interface ActiveWalk {
  startPoint: LatLng;
  destPoint: LatLng;
  radiusKm: number;
  difficulty: Difficulty;
  timerSeconds: number | null;
  startedAt: string; // ISO timestamp
}

// ── Setup draft config ──
// The setup screen's state, persisted on every change so a refresh mid-setup
// keeps the user's work; cleared once a walk starts (the ActiveWalk record
// takes over). See docs/technical/storage.md.
export interface SetupState {
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  radiusKm: number;
  difficulty: Difficulty;
  timerSeconds: number | null;
}
