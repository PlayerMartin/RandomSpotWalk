# Random Spot Walker — Project Scope & Documentation

> **See also:** [Implementation Plan](./impl-plan.md) for the technical build order, architecture decisions, and file-by-file specs.

## 1. Overview

A mobile-first web app where users generate a random destination on a map within a chosen radius and physically walk there while being tracked via GPS. Upon arrival (within the difficulty-defined range), the walk is completed and stats are saved.

## 2. Tech Stack

| Layer        | Choice                         |
| ------------ | ------------------------------ |
| Framework    | React 18+                      |
| Build Tool   | Vite                           |
| Language     | TypeScript                     |
| Maps         | Leaflet + OpenStreetMap tiles  |
| Styling      | Tailwind CSS                   |
| Persistence  | localStorage                   |
| GPS          | Browser Geolocation API        |

## 3. Game Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Setup      │────▶│  Walking     │────▶│  Completed   │
│  Screen     │     │  Screen      │     │  Screen      │
└─────────────┘     └──────────────┘     └──────────────┘
                          │
                          │ (auto-detected)
                          │ GPS within threshold
                          ▼
                    arrival triggers
                    auto-transition
```

### 3.1 Setup Screen
- User taps on the map to place the **starting point** (or uses current GPS position)
- User inputs a **radius in kilometers**
- User selects **difficulty**: Easy (1km) / Medium (500m) / Hard (10m)
  - This defines how close they must get to the destination to "win"
- User can optionally set a **countdown timer**
- User clicks **"Generate Spot"** → a random point is placed within the radius circle
- If unhappy with the spot, user can **re-roll** (generates a new random point)
- User clicks **"Start Walk"** to begin

### 3.2 Walking Screen (Active Walk)
- Map shows:
  - Starting point (marker)
  - Destination point (marker)
  - User's current GPS position (live-updating marker)
  - Radius circle around destination (difficulty-based)
- Distance to destination displayed and updated live
- Optional countdown timer counting down (if set)
- **"Cancel Walk"** button to abort

### 3.3 Arrival Detection
- When the user's GPS position falls within the difficulty threshold of the destination:
  - The walk auto-transitions to the completion screen
  - No user interaction required

### 3.4 Completion Screen
- Shows the elapsed time (and countdown remaining if timer was set)
- Shows any newly unlocked achievements as toasts
- Updated streak counter displayed
- "Start New Walk" button returns to Setup

## 4. Data Models

### 4.1 Walk (saved to localStorage)

```typescript
interface Walk {
  id: string;                    // UUID
  startedAt: string;             // ISO timestamp
  completedAt: string;           // ISO timestamp
  startPoint: LatLng;            // { lat: number, lng: number }
  destinationPoint: LatLng;
  radiusKm: number;              // the radius the user set
  difficulty: 'easy' | 'medium' | 'hard';
  thresholdMeters: number;       // actual threshold based on difficulty
  timerSetSeconds: number | null; // optional countdown, null if not set
  elapsedSeconds: number;        // time taken to complete
  status: 'completed' | 'cancelled';
}
```

### 4.2 Walk History

```typescript
interface WalkHistory {
  walks: Walk[];
}
```

Stored under `localStorage` key: `random-spot-walk-history`

### 4.3 Gamification (Streaks & Achievements)

```typescript
// Stored under localStorage key: random-spot-walk-gamification
interface GamificationState {
  currentStreak: number;         // consecutive days with at least 1 completed walk
  bestStreak: number;
  lastWalkDate: string | null;   // ISO date string (YYYY-MM-DD) of most recent walk
  unlockedAchievements: Achievement[];
}

interface Achievement {
  id: string;                    // unique key, e.g. 'first-walk', 'walk-10'
  title: string;                 // e.g. "First Steps"
  description: string;           // e.g. "Complete your first walk"
  unlockedAt: string;            // ISO timestamp
}

// Achievement definitions (hardcoded in app, not stored per-user):
const ACHIEVEMENTS = [
  { id: 'first-walk',      title: 'First Steps',        description: 'Complete your first walk' },
  { id: 'walk-5',          title: 'Getting Around',      description: 'Complete 5 walks' },
  { id: 'walk-10',         title: 'Explorer',            description: 'Complete 10 walks' },
  { id: 'walk-25',         title: 'Marathoner',          description: 'Complete 25 walks' },
  { id: 'hard-walk',       title: 'Precision Walker',    description: 'Complete a walk on Hard difficulty (10m)' },
  { id: 'far-walk',        title: 'Long Haul',           description: 'Complete a walk with a 10km+ radius' },
  { id: 'streak-3',        title: 'Consistent',          description: 'Reach a 3-day streak' },
  { id: 'streak-7',        title: 'Dedicated',           description: 'Reach a 7-day streak' },
  { id: 'speed-demon',     title: 'Speed Demon',         description: 'Complete a walk with a timer under 5 minutes remaining' },
];
```

## 4. Key Technical Decisions

### 4.1 GPS Tracking
- Use `navigator.geolocation.watchPosition()` for live tracking
- Configurable update interval (e.g., every 5 seconds or 10 meters)
- Handle permission denied gracefully with a fallback message
- Not a PWA — GPS tracking stops when screen locks (out of scope for v1)

### 4.2 Map Tile Style
- Default to OpenStreetMap light tiles
- Toggle button to switch to a dark variant (CartoDB Dark Matter)
- Preference stored in localStorage key: `random-spot-walk-map-style`

### 4.3 Random Point Generation
- Given a center point and radius R in km:
  1. Convert R to degrees (approx: 1° ≈ 111.32 km, adjust for latitude)
  2. Generate random angle θ ∈ [0, 2π)
  3. Generate random distance r = R × √(random) (uniform in area)
  4. Compute new lat/lng using the Haversine formula inverse

### 4.4 Distance Calculation
- Use the **Haversine formula** to calculate straight-line distance between two lat/lng points
- This is used both for arrival detection and for displaying distance remaining

### 4.5 Leaflet Map
- Use `react-leaflet` for React integration
- OpenStreetMap tile layer (free, no API key)
- Custom markers for start, destination, and user position
- Circle overlay for destination threshold radius

### 4.6 localStorage Schema
- Walk history: `random-spot-walk-history` → `Walk[]`
- Gamification: `random-spot-walk-gamification` → `GamificationState`
- Map style preference: `random-spot-walk-map-style` → `'light' | 'dark'`
- Read on app mount, write on relevant events
- No size concerns (all entries are tiny)

### 4.7 Gamification Engine
- On walk completion, check all achievement conditions
- Show a toast/popup for newly unlocked achievements
- Streak logic: compare `lastWalkDate` to today; if yesterday, increment streak; if today, no change; otherwise reset to 1
- Gamification stored separately from walk history under `random-spot-walk-gamification`

## 6. UI/UX Principles

- **Mobile-first:** Primary use case is on a phone while walking
- **Large touch targets:** Buttons and map interactions must be finger-friendly
- **High contrast:** Usable in sunlight (outdoor use)
- **Clear visual hierarchy:** Setup → Walk → Complete states are visually distinct
- **Smooth transitions:** between app states/phases
- **Minimal clutter:** Only essential info on the walking screen (distance + optional timer)
- **Map theme toggle:** User can switch between light and dark map tiles
- **Achievement toasts:** Non-intrusive popups when achievements unlock

## 7. Open Questions / Needs Clarification

All questions resolved ✅

| # | Question | Resolution |
|---|----------|------------|
| 1 | PWA? | No — regular web app, GPS stops when screen locks |
| 2 | Map layer style? | User-toggleable (light/dark) |
| 3 | Arrival alert behavior? | Auto-transition to completion screen |
| 4 | Radius limits? | No min/max constraints |
| 5 | GPS path tracking? | No breadcrumbs — keep it lean |
| 6 | Multiple walks at once? | Single active walk only |
| 7 | Gamification? | Streaks + achievements |

## 8. Out of Scope (v1)

- User accounts / authentication
- Backend server / API
- Social features (sharing walks, leaderboards)
- Offline maps
- Turn-by-turn walking directions
- Avoiding obstacles (water, highways) — purely straight-line radius
- Multiple simultaneous active walks
- PWA / background GPS tracking
- GPS breadcrumb path tracking
