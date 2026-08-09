# Product Scope

A mobile-first web app where users generate a random destination on a map
within a chosen radius and physically walk there while being tracked via GPS.
Upon arrival (within the difficulty-defined range), the walk completes
automatically and stats are saved. See [overview](overview.md) for the tech
stack and setup.

## Game Flow

Three phases in order — `setup → walking → completed` — with one automatic transition:

1. **Setup** — place start point, set radius / difficulty / optional timer, generate the spot.
   → **Walking** via `Start Walk`.
2. **Walking** — live GPS distance + optional countdown.
   → **Completed** automatically when the GPS position falls within the difficulty threshold
   of the destination (no user interaction).
3. **Completed** — stats, streak, achievement toasts.
   → **Setup** via `Start New Walk` (loop).

Cancelling in *Walking* also returns to Setup (recorded as a cancelled walk).

### 3.1 Setup Screen
- Tap the map to place the **starting point** (or use current GPS position).
- Input a **radius in kilometers** (changing it clears the generated spot).
- Select **difficulty** — how close you must get to "win" (see
  `DIFFICULTY_THRESHOLDS` in `src/types`).
- Optionally set a **countdown timer**.
- **"Generate Spot"** → a random point placed within the radius circle;
  **Re-roll** generates a new one.
- **"Start Walk"** begins when a spot exists.

### 3.2 Walking Screen (Active Walk)
- Map shows start point, destination, and live GPS position; a difficulty-based
  radius circle around the destination.
- Live distance to destination; optional countdown; **"Cancel Walk"** button.

### 3.3 Arrival Detection
- When GPS position falls within the difficulty threshold of the destination,
  the walk **auto-transitions** to completion — no user interaction.

### 3.4 Completion Screen
- Elapsed time (and countdown remaining if set); newly unlocked achievements as
  toasts; updated streak counter; **"Start New Walk"** returns to Setup.

## Data Models

All type definitions live in [`src/types/index.ts`](../../src/types/index.ts)
— reference them there rather than duplicating here:

- **`Walk`** — one completed/cancelled walk (id, timestamps, points, radius,
  difficulty, threshold, timer, elapsed, status).
- **`GamificationState`** — current/best streak, `lastWalkDate`, achievements.
- **`Achievement`** — id/title/description/`unlockedAt`; catalog hard-coded in
  `utils/achievements.ts`.
- **`ActiveWalk`** / **`SetupState`** — persistence shims (see
  [storage](../technical/storage.md)).

## Key Technical Decisions

- **GPS:** `navigator.geolocation.watchPosition` (5s/10m options); permission
  denied handled with a visible error, not a crash.
- **Map tiles:** OpenStreetMap light by default; CartoDB Dark Matter toggle —
  preference stored under `random-spot-walk-map-style`.
- **Random point gen:** `r = R × √(random)` for uniform area distribution;
  metric km → degrees conversion adjusted for latitude.
- **Distance calc:** Haversine formula (used for both arrival and display).
- **Leaflet:** react-leaflet; custom CSS markers; destination threshold circle.

## Gamification Engine

- **Streaks:** consecutive days with ≥1 completed walk (compare `lastWalkDate`
  to today/yesterday; local-date, not `toISOString`).
- **Achievements:** 9 hard-coded definitions with conditions checked on each
  walk completion; newly unlocked ones surface as toasts.

→ Details in [technical flows](../technical/flows.md).

## UI/UX Principles

- **Mobile-first:** primary use is on a phone while walking.
- **Large touch targets:** finger-friendly buttons and interactions.
- **High contrast:** usable in sunlight (outdoor use).
- **Clear visual hierarchy:** Setup / Walk / Complete states visually distinct.
- **Minimal clutter:** walking screen shows only distance + optional timer.
- **Achievement toasts:** non-intrusive popups when achievements unlock.

## Out of Scope (v1)

- User accounts / authentication
- Backend server / API
- Social features (sharing, leaderboards)
- Offline maps
- Turn-by-turn directions
- Obstacle avoidance (water, highways) — purely straight-line radius
- Multiple simultaneous active walks
- PWA / background GPS tracking
- GPS breadcrumb path tracking

→ [architecture](../technical/architecture.md) · [storage](../technical/storage.md)
