# Implementation Plan — Random Spot Walker

> **See also:** [Project Scope](./scope.md) for requirements, game flow, and data model details.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand | Minimal boilerplate, selector-based re-renders, no provider nesting |
| Folder structure | Type-based (flat) | Small project — don't over-split |
| Map instance | Single shared `<MapView>` | State preserved across screen transitions |
| Timer | Date-based (wall clock) | Accurate, survives tab sleep, no drift |
| Styling | Tailwind CSS | Utility-first, rapid iteration |

## Project Structure

```
src/
├── main.tsx                  # ReactDOM entry
├── App.tsx                   # Shell: MapView + active screen + panels
├── types/
│   └── index.ts              # All TS interfaces & constants
├── utils/
│   ├── geo.ts                # Haversine distance + random point generation
│   ├── achievements.ts       # Achievement definitions + check logic
│   └── storage.ts            # localStorage read/write helpers
├── stores/
│   ├── appStore.ts           # Core phase state machine + walk config
│   ├── gpsStore.ts           # Geolocation watch state
│   ├── historyStore.ts       # Walk history (persisted)
│   ├── gamificationStore.ts  # Streaks & achievements (persisted)
│   └── settingsStore.ts      # Map theme preference
├── hooks/
│   ├── useGeolocation.ts     # Wraps navigator.geolocation.watchPosition
│   ├── useTimer.ts           # Date-based elapsed timer + countdown
│   └── useAchievements.ts    # Checks & unlocks achievements on walk complete
├── components/
│   ├── MapView.tsx           # Single shared Leaflet map with dynamic overlays
│   ├── screens/
│   │   ├── SetupScreen.tsx   # Start point picker + radius + difficulty + generate
│   │   ├── WalkingScreen.tsx # Live HUD: distance, timer, cancel
│   │   └── CompletionScreen.tsx # Stats, streak, achievements, new walk
│   ├── panels/
│   │   ├── WalkHistoryPanel.tsx   # Slide-up drawer with past walks
│   │   └── GamificationPanel.tsx  # Achievement list + streak stats
│   └── ui/
│       ├── AchievementToast.tsx   # Non-intrusive unlock popup
│       ├── DifficultySelector.tsx # Easy / Medium / Hard buttons
│       ├── RadiusInput.tsx        # Kilometer input
│       ├── TimerToggle.tsx        # Optional countdown input
│       └── ActionButtons.tsx      # Generate / Re-roll / Start Walk
└── index.css                 # Tailwind directives + base styles
```

## Implementation Steps

### Step 1: Scaffold project

```bash
npm create vite@latest . -- --template react-ts
npm install zustand react-leaflet leaflet
npm install -D tailwindcss @tailwindcss/vite @types/leaflet
```

- Configure `vite.config.ts` with Tailwind plugin
- Replace `src/index.css` with Tailwind directives
- Delete boilerplate: `App.css`, `assets/`

### Step 2: Types — `src/types/index.ts`

All shared types and constants in one file:

```typescript
// ── Coordinates ──
export interface LatLng {
  lat: number;
  lng: number;
}

// ── Difficulty ──
export type Difficulty = 'easy' | 'medium' | 'hard';
export const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = {
  easy: 1000,    // meters
  medium: 500,
  hard: 10,
};

// ── App Phase ──
export type AppPhase = 'setup' | 'walking' | 'completed';

// ── Walk ──
export interface Walk {
  id: string;
  startedAt: string;           // ISO timestamp
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
  unlockedAt: string | null;   // null = not yet unlocked
}
export interface GamificationState {
  currentStreak: number;
  bestStreak: number;
  lastWalkDate: string | null; // YYYY-MM-DD
  achievements: Achievement[];
}

// ── Map Theme ──
export type MapTheme = 'light' | 'dark';
```

### Step 3: Geo utilities — `src/utils/geo.ts`

Two pure functions:

```typescript
// Returns distance in meters between two lat/lng points (Haversine)
export function haversineDistance(a: LatLng, b: LatLng): number;

// Returns a random LatLng uniformly distributed within a circle
export function randomPointInCircle(center: LatLng, radiusKm: number): LatLng;
```

**Key details:**
- `randomPointInCircle` uses `r = R * sqrt(Math.random())` for uniform area distribution
- Latitude degrees → km conversion: `1° lat ≈ 111.32 km`
- Longitude degrees → km: `1° lng ≈ 111.32 * cos(lat)` at that latitude

### Step 4: Achievement definitions — `src/utils/achievements.ts`

```typescript
import { Achievement, Walk, GamificationState } from '../types';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  { id: 'first-walk',  title: 'First Steps',       description: 'Complete your first walk', unlockedAt: null },
  { id: 'walk-5',      title: 'Getting Around',     description: 'Complete 5 walks', unlockedAt: null },
  { id: 'walk-10',     title: 'Explorer',           description: 'Complete 10 walks', unlockedAt: null },
  { id: 'walk-25',     title: 'Marathoner',         description: 'Complete 25 walks', unlockedAt: null },
  { id: 'hard-walk',   title: 'Precision Walker',   description: 'Complete a walk on Hard difficulty (10m)', unlockedAt: null },
  { id: 'far-walk',    title: 'Long Haul',          description: 'Complete a walk with a 10km+ radius', unlockedAt: null },
  { id: 'streak-3',    title: 'Consistent',         description: 'Reach a 3-day streak', unlockedAt: null },
  { id: 'streak-7',    title: 'Dedicated',          description: 'Reach a 7-day streak', unlockedAt: null },
  { id: 'speed-demon', title: 'Speed Demon',        description: 'Complete a walk with under 5 min on the timer', unlockedAt: null },
];

// Returns achievements that just became unlockable (for toast display)
export function checkNewAchievements(
  current: Achievement[],
  totalWalks: number,
  walk: Walk,
  streak: number,
): Achievement[];
```

**Check logic (run on every walk completion):**

| Achievement | Condition |
|---|---|
| `first-walk` | `totalWalks === 1` |
| `walk-5` | `totalWalks >= 5` |
| `walk-10` | `totalWalks >= 10` |
| `walk-25` | `totalWalks >= 25` |
| `hard-walk` | `walk.difficulty === 'hard'` |
| `far-walk` | `walk.radiusKm >= 10` |
| `streak-3` | `streak >= 3` |
| `streak-7` | `streak >= 7` |
| `speed-demon` | `walk.timerSetSeconds !== null && walk.timerSetSeconds - walk.elapsedSeconds < 300` |

### Step 5: localStorage helpers — `src/utils/storage.ts`

```typescript
import { Walk, GamificationState } from '../types';

const KEYS = {
  history: 'random-spot-walk-history',
  gamification: 'random-spot-walk-gamification',
  mapTheme: 'random-spot-walk-map-style',
} as const;

export function loadWalks(): Walk[];
export function saveWalks(walks: Walk[]): void;
export function loadGamification(): GamificationState;
export function saveGamification(state: GamificationState): void;
export function loadMapTheme(): MapTheme;
export function saveMapTheme(theme: MapTheme): void;
```

**Edge cases:** Handle `JSON.parse` failures (corrupt data) → return defaults (empty array, fresh gamification state, `'light'` theme).

### Step 6: Zustand stores — `src/stores/`

#### `appStore.ts` — Core state machine

```typescript
interface AppState {
  phase: AppPhase;
  // Walk config (populated during setup)
  startPoint: LatLng | null;
  destPoint: LatLng | null;
  radiusKm: number;
  difficulty: Difficulty;
  timerSeconds: number | null;  // null = no timer
  startedAt: string | null;     // ISO timestamp when walk begins
  // Result
  completedWalk: Walk | null;   // set when walk ends
  newlyUnlocked: Achievement[]; // for toast display
  // Actions
  setStartPoint: (point: LatLng) => void;
  setRadius: (km: number) => void;
  setDifficulty: (d: Difficulty) => void;
  setTimer: (seconds: number | null) => void;
  generateDest: () => void;     // calls randomPointInCircle
  rerollDest: () => void;       // same as generateDest
  startWalk: () => void;        // sets phase='walking', records startedAt
  completeWalk: () => void;     // builds Walk, sets phase='completed'
  cancelWalk: () => void;       // builds Walk with status='cancelled'
  resetToSetup: () => void;     // back to setup, clears current walk
}
```

**Design notes:**
- `generateDest`/`rerollDest` call `randomPointInCircle(startPoint, radiusKm)` — pure, no async
- `completeWalk` builds a `Walk` object, pushes to historyStore, triggers achievement check, sets `newlyUnlocked`
- `cancelWalk` also builds a `Walk` (status = `'cancelled'`) and saves it

#### `gpsStore.ts` — Geolocation wrapper

```typescript
interface GpsState {
  position: LatLng | null;
  error: string | null;
  watching: boolean;
  watchId: number | null;
  startWatching: () => void;
  stopWatching: () => void;
}
```

**Design notes:**
- `startWatching` calls `navigator.geolocation.watchPosition()` with `{ enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }`
- Store the `watchId` for cleanup
- `stopWatching` calls `navigator.geolocation.clearWatch(watchId)` and sets `watching: false`
- Handle permission errors gracefully: set `error` string, don't crash

#### `historyStore.ts` — Persisted walk history

```typescript
interface HistoryState {
  walks: Walk[];
  addWalk: (walk: Walk) => void;
  load: () => void;             // hydrate from localStorage on mount
}
```

- `addWalk`: prepend to array, call `saveWalks()`
- `load`: call `loadWalks()`, set state

#### `gamificationStore.ts` — Streaks & achievements (persisted)

```typescript
interface GamificationStateStore extends GamificationState {
  load: () => void;
  processWalkCompletion: (walk: Walk) => Achievement[]; // returns newly unlocked
}
```

- `processWalkCompletion`: compute streak, check achievements, persist, return new unlocks
- Streak logic:
  - `today = new Date().toISOString().slice(0, 10)`
  - If `lastWalkDate === today` → no streak change
  - If `lastWalkDate === yesterday` → increment streak
  - Otherwise → reset streak to 1
  - Always update `bestStreak = max(bestStreak, currentStreak)`

#### `settingsStore.ts` — Map theme

```typescript
interface SettingsState {
  mapTheme: MapTheme;
  toggleTheme: () => void;
  load: () => void;
}
```

- `toggleTheme`: flip `'light'` ↔ `'dark'`, persist via `saveMapTheme()`
- `load`: hydrate from localStorage

### Step 7: Custom hooks — `src/hooks/`

#### `useTimer.ts`

```typescript
// Returns elapsed seconds since startTime, and (if countdown) remaining seconds
export function useTimer(startedAt: string | null, countdownSeconds: number | null): {
  elapsed: number;
  remaining: number | null;     // null if no countdown set
  isExpired: boolean;           // true if countdown reached 0
};
```

**Design:**
- Use `useRef` to store `startedAt` as `Date` (so `Date.now()` comparisons work across re-renders)
- `useState` for the display value, updated via `setInterval(1000)` 
- On each tick: `elapsed = Math.floor((Date.now() - startDate) / 1000)`, `remaining = countdownSeconds - elapsed`
- When `startedAt` changes (new walk), reset the start date ref
- Cleanup interval on unmount

#### `useAchievements.ts`

```typescript
export function useAchievements(): {
  newlyUnlocked: Achievement[];
  clearNewlyUnlocked: () => void;
};
```

Thin wrapper that reads `newlyUnlocked` from `gamificationStore` and provides a clear function. Used by `CompletionScreen` to show toasts then dismiss them.

### Step 8: Shared MapView component — `src/components/MapView.tsx`

The single Leaflet map instance. Accepts children for overlays — each screen renders its own overlays inside `<MapView>`:

```tsx
// Usage pattern:
<MapView>
  {phase === 'setup'    && <SetupOverlays />}
  {phase === 'walking'  && <WalkingOverlays />}
  {phase === 'completed' && <CompletedOverlays />}
</MapView>
```

**MapView responsibilities:**
- Render `<MapContainer>` with `react-leaflet`
- `TileLayer` with URL based on `mapTheme` from settingsStore
  - Light: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - Dark: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
- `MapController` child component that calls `map.flyTo()` / `map.fitBounds()` reactively
- Centered on `startPoint` with reasonable zoom (e.g., fit radius circle + 20% padding)

**Overlay sets (rendered as children of MapView):**

| Phase | Markers & Shapes |
|---|---|
| Setup | Click handler on map → `setStartPoint`; `Circle` for radius; `Marker` for start point; `Marker` for destination (after generate) |
| Walking | `Marker` start (static); `Marker` destination (static); `Circle` threshold radius around dest; `Marker` for live GPS position (animated/div-icon) |
| Completed | `Marker` start; `Marker` destination; `Circle` threshold radius around dest |

**GPS marker:** Use a custom `divIcon` with a pulsating blue dot CSS animation to distinguish from start/destination markers.

### Step 9: Screens — `src/components/screens/`

#### `SetupScreen.tsx`

- Renders inside App, overlays on the shared MapView
- Contains UI controls below/overlaid on map:
  - `RadiusInput` — number input, km
  - `DifficultySelector` — three pill buttons
  - `TimerToggle` — checkbox + number input for countdown minutes
  - `ActionButtons` — "Generate Spot" (primary), "Re-roll" (secondary, shown only after generate), "Start Walk" (primary, shown after generate)
- "Use my location" button to set start point from GPS
- Edge case: start point must be set before generate

#### `WalkingScreen.tsx`

- Minimal UI overlaid on map
- HUD bar at bottom showing:
  - Distance remaining (meters, live-updating)
  - Timer (elapsed + countdown if set, updates every second)
  - "Cancel Walk" button
- When `remaining <= 0` (within threshold): call `completeWalk()` → auto-transition
- When countdown expires: treat as cancellation (call `cancelWalk()`)

#### `CompletionScreen.tsx`

- Full-screen overlay or card
- Stats display: elapsed time (formatted as `MM:SS`)
- If countdown was set: show "X:XX remaining" or "time expired"
- Streak display: current streak, best streak
- Achievement toasts: iterate `newlyUnlocked`, render `<AchievementToast>` for each
- "Start New Walk" button → calls `resetToSetup()`
- "View History" link/button → opens WalkHistoryPanel

### Step 10: Panels — `src/components/panels/`

#### `WalkHistoryPanel.tsx`

- Slide-up drawer (fixed bottom, transform translateY animation)
- List of past walks, most recent first
- Each entry: date, start → dest (approx address or coords), time taken, difficulty badge, cancelled indicator
- "Clear history" button with confirmation
- Pull from `historyStore.walks`

#### `GamificationPanel.tsx`

- Grid/list of all achievement definitions
- Locked achievements shown greyed out
- Unlocked ones shown in color with unlock date
- Streak stats at top: current streak 🔥, best streak 👑
- Pull from `gamificationStore`

### Step 11: UI components — `src/components/ui/`

Small, presentational components with Tailwind styling:

| Component | Props | Notes |
|---|---|---|
| `DifficultySelector` | `value`, `onChange` | Three styled radio/pill buttons |
| `RadiusInput` | `value`, `onChange` | Number input with "km" suffix |
| `TimerToggle` | `enabled`, `seconds`, `onToggle`, `onChange` | Checkbox + number input for minutes |
| `ActionButtons` | `phase`, `hasDest`, `onGenerate`, `onReroll`, `onStart` | Contextual button group |
| `AchievementToast` | `achievement`, `onDismiss` | Animated toast, auto-dismiss after 4s |

### Step 12: App shell — `src/App.tsx`

```tsx
function App() {
  const phase = useAppStore(s => s.phase);

  // Hydrate persisted stores on mount
  useEffect(() => {
    historyStore.getState().load();
    gamificationStore.getState().load();
    settingsStore.getState().load();
  }, []);

  return (
    <div className="h-dvh w-full flex flex-col relative">
      <MapView>
        {phase === 'setup'     && <SetupOverlays />}
        {phase === 'walking'   && <WalkingOverlays />}
        {phase === 'completed' && <CompletedOverlays />}
      </MapView>
      {phase === 'setup'     && <SetupScreen />}
      {phase === 'walking'   && <WalkingScreen />}
      {phase === 'completed' && <CompletionScreen />}
      <MapThemeToggle />          {/* Fixed position, top-right corner */}
      <WalkHistoryPanel />
      <GamificationPanel />
    </div>
  );
}
```

**Key integration points:**
- MapView always mounted (single instance preserved)
- Phase changes swap screen components but keep MapView alive
- Theme toggle always accessible in top-right corner
- Panels triggered by UI buttons, slide in from bottom

### Step 13: Entry point — `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

---

## Dependency Graph

```
Step 1 (scaffold)
   │
Step 2 (types) ─────────────────────────────────────────────┐
   │                                                        │
Step 3 (geo utils) ─── Step 4 (achievements) ─── Step 5 (storage)
   │                         │                            │
   └─────────┬───────────────┴────────────┬───────────────┘
             ▼                            ▼
      Step 6 (stores) ────────────► Step 7 (hooks)
             │                            │
             └────────────┬───────────────┘
                          ▼
                   Step 8 (MapView)
                          │
                   Step 9 (screens)
                          │
              Step 10 (panels) + Step 11 (ui components)
                          │
                   Step 12 (App.tsx) + Step 13 (main.tsx)
```

## Edge Cases & Guardrails

| Scenario | Handling |
|---|---|
| GPS permission denied | Show error message in HUD, allow manual start point entry, no live tracking |
| GPS unavailable (desktop) | Same as above — app still works with manual start point |
| localStorage full/quota exceeded | Catch on write, show toast warning, app continues working in-memory |
| Corrupt localStorage data | `try/catch` in load helpers, return safe defaults |
| Walk started without destination generated | "Start Walk" button disabled until `generateDest` called |
| Countdown reaches 0 during walk | Treat as cancellation (walk status = `'cancelled'`) |
| User closes tab mid-walk | Walk is lost (no PWA, no background state) — acceptable for v1 |
| Generate spot returns water/inaccessible | User uses re-roll — no map-aware obstacle detection in v1 |
| Radius = 0 | Generate spot = same as start point (degenerate but mathematically valid) |
| Very large radius (>50km) | Works correctly but Haversine + random point generation still accurate |

## Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "leaflet": "^1.9",
    "react-leaflet": "^4.2",
    "zustand": "^5.0"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9",
    "@types/react": "^18.3",
    "@types/react-dom": "^18.3",
    "@vitejs/plugin-react": "^4.3",
    "tailwindcss": "^4.0",
    "@tailwindcss/vite": "^4.0",
    "typescript": "^5.6",
    "vite": "^6.0"
  }
}
```