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
// Subset of app state needed to resume an in-progress walk after a page
// refresh or browser restart. Persisted under `random-spot-walk-active`.
// The elapsed time is not stored — it's recomputed from `startedAt`, so
// the timer stays accurate across reloads.
export interface ActiveWalk {
  startPoint: LatLng;
  destPoint: LatLng;
  radiusKm: number;
  difficulty: Difficulty;
  timerSeconds: number | null;
  startedAt: string; // ISO timestamp
}
