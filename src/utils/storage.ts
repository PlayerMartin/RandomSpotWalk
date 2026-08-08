import type { ActiveWalk, GamificationState, MapTheme, MapViewState, Walk } from '../types';
import { ACHIEVEMENT_DEFINITIONS } from './achievements';

const KEYS = {
  history: 'random-spot-walk-history',
  gamification: 'random-spot-walk-gamification',
  mapTheme: 'random-spot-walk-map-style',
  active: 'random-spot-walk-active',
  mapView: 'random-spot-walk-map-view',
} as const;

export function freshGamification(): GamificationState {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastWalkDate: null,
    achievements: ACHIEVEMENT_DEFINITIONS.map((a) => ({ ...a })),
  };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadWalks(): Walk[] {
  return safeParse<Walk[]>(localStorage.getItem(KEYS.history), []);
}

export function saveWalks(walks: Walk[]): void {
  try {
    localStorage.setItem(KEYS.history, JSON.stringify(walks));
  } catch {
    // localStorage quota exceeded — app continues working in-memory
  }
}

export function loadGamification(): GamificationState {
  return safeParse<GamificationState>(localStorage.getItem(KEYS.gamification), freshGamification());
}

export function saveGamification(state: GamificationState): void {
  try {
    localStorage.setItem(KEYS.gamification, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function loadMapTheme(): MapTheme {
  const v = localStorage.getItem(KEYS.mapTheme);
  return v === 'dark' ? 'dark' : 'light';
}

export function saveMapTheme(theme: MapTheme): void {
  try {
    localStorage.setItem(KEYS.mapTheme, theme);
  } catch {
    // ignore
  }
}

// ── Last map viewport ──
// Persists so the map reopens where the user left off.
function isValidMapView(v: unknown): v is MapViewState {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  const c = o.center as { lat?: unknown; lng?: unknown } | undefined;
  return (
    !!c &&
    typeof c.lat === 'number' &&
    typeof c.lng === 'number' &&
    typeof o.zoom === 'number' &&
    o.zoom >= 1 &&
    o.zoom <= 19
  );
}

export function loadMapView(): MapViewState | null {
  const raw = loadRaw(KEYS.mapView);
  if (!raw) return null;
  const parsed = safeParse<unknown>(raw, null);
  return isValidMapView(parsed) ? parsed : null;
}

function loadRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveMapView(view: MapViewState): void {
  try {
    localStorage.setItem(KEYS.mapView, JSON.stringify(view));
  } catch {
    // ignore
  }
}

// ── Active (in-progress) walk ──
// Lets the app resume an in-progress walk after a page refresh/restart.

// Structural check so a corrupt/partial payload doesn't resurrect a broken walk.
function isValidActiveWalk(v: unknown): v is ActiveWalk {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  const p = o.startPoint as { lat?: unknown; lng?: unknown } | undefined;
  const d = o.destPoint as { lat?: unknown; lng?: unknown } | undefined;
  return (
    !!p &&
    typeof p.lat === 'number' &&
    typeof p.lng === 'number' &&
    !!d &&
    typeof d.lat === 'number' &&
    typeof d.lng === 'number' &&
    typeof o.radiusKm === 'number' &&
    (o.difficulty === 'easy' || o.difficulty === 'medium' || o.difficulty === 'hard') &&
    (o.timerSeconds === null || typeof o.timerSeconds === 'number') &&
    typeof o.startedAt === 'string'
  );
}

export function loadActiveWalk(): ActiveWalk | null {
  const raw = localStorage.getItem(KEYS.active);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return isValidActiveWalk(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveWalk(walk: ActiveWalk): void {
  try {
    localStorage.setItem(KEYS.active, JSON.stringify(walk));
  } catch {
    // localStorage quota exceeded — walk stays in memory only
  }
}

export function clearActiveWalk(): void {
  try {
    localStorage.removeItem(KEYS.active);
  } catch {
    // ignore
  }
}
