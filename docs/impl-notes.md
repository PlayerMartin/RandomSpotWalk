# Implementation Notes — Random Spot Walker

Implementation notes for future LLM agents / maintainers. Read this **before** modifying code. For product requirements & data models, see [`scope.md`](./scope.md); the original build order is in [`impl-plan.md`](./impl-plan.md) (note: actual code drifts from it in places — this doc is authoritative).

## 1. Overview

A mobile-first web app where a user sets a start point + radius, generates a **random destination** inside the circle, then physically walks to it while being tracked via browser GPS. When within the difficulty threshold, the walk auto-completes; stats/streaks/achievements are stored locally.

**State machine:** `setup → walking → completed`. No backend, no auth, no accounts.

## 2. Tech Stack (actual)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 | `main.tsx` intentionally has **no `<StrictMode>`** — see gotchas |
| Build | Vite 8 | HTTPS-only dev/preview configured (mkcert) |
| Language | TypeScript | `verbatimModuleSyntax` → type-only imports must use `import type` |
| Maps | **react-leaflet v5** + Leaflet 1.9 | OSM light / CartoDB dark tiles |
| State | Zustand v5 | 6 small stores |
| Styling | Tailwind v4 (`@tailwindcss/vite`) | `@import "tailwindcss"` in `index.css` |
| Persistence | localStorage | 3 keys |
| GPS | `navigator.geolocation.watchPosition` | requires secure context |

## 3. Setup & Commands

```bash
npm install
npm run dev        # HTTPS dev server (needs .certs/, see below)
npm run build      # tsc -b && vite build
npm run preview    # HTTPS preview
```

**Node version — REQUIRED:** Use **Node 20 LTS**. Node 22.21+ has a regression
(`server.shouldUpgradeCallback is not a function`) that crashes Vite's dev server
(non-Vite bug). If you see that error:
```bash
nvm install 20 && nvm use 20
rm -rf node_modules && npm install   # (or pnpm install)
```

**HTTPS / mkcert (prerequisite for `npm run dev` and for mobile GPS):**
- Certs must exist at `.certs/key.pem` + `.certs/cert.pem` (git-ignored).
- Generate: `mkcert -install`, then
  `cd .certs && mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 <LAN-IP> ::1`.
- On a phone you must also install the mkcert root CA and fix the browser's
  IP/hostname in settings. Mobile GPS **only works over HTTPS** (secure context).

## 4. Project Structure

```
src/
├── main.tsx                    # ReactDOM entry (NO StrictMode)
├── App.tsx                     # Shell: MapView + header + per-phase screen + panels
├── index.css                   # Tailwind + Leaflet/marker/toast/panel CSS
├── types/index.ts              # All interfaces + DIFFICULTY_THRESHOLDS / labels
├── utils/
│   ├── geo.ts                  # haversineDistance, randomPointInCircle, circleBounds, formatDistance
│   ├── achievements.ts         # ACHIEVEMENT_DEFINITIONS + checkNewAchievements
│   └── storage.ts              # load/save for walks, gamification, theme (safe JSON)
├── stores/
│   ├── appStore.ts             # ★ phase machine + walk config/result + action coordination
│   ├── gpsStore.ts             # watchPosition lifecycle + error strings
│   ├── historyStore.ts         # walks list (persisted); addWalk/load/clear/completedCount
│   ├── gamificationStore.ts    # streaks + achievements; processWalkCompletion
│   ├── settingsStore.ts        # map theme (persisted)
│   └── uiStore.ts              # which panel is open (history | gamification | null)
├── hooks/
│   ├── useGeolocation.ts       # start/stop watch tied to `active`
│   ├── useTimer.ts             # date-based elapsed + countdown (tab-sleep safe)
│   └── useAchievements.ts      # reads appStore.newlyUnlocked + clear
└── components/
    ├── MapView.tsx             # ★ shared map: container, click capture, controller, overlays
    ├── MapThemeToggle.tsx      # fixed top-right theme flip
    ├── screens/                # SetupScreen, WalkingScreen, CompletionScreen
    ├── panels/                 # WalkHistoryPanel, GamificationPanel (slide-up drawers)
    └── ui/                     # DifficultySelector, RadiusInput, TimerToggle, ActionButtons, AchievementToast
```

## 5. Counterintuitive / fragile implementation notes (READ)

These are the parts that visually look fine but are easy to break:

1. **No `<StrictMode>` in `main.tsx`.** react-leaflet v5 + React 19 double-mounts
   under StrictMode → blank/non-interactive map with **no console error**. Don't re-add it.

2. **Map click-to-select does NOT use Leaflet's `click` event.** react-leaflet v5's
   `MapContainer` `eventHandlers` and `map.on('click')` both proved unreliable here.
   `MapClickCapture` (a child of `MapContainer`) binds a **DOM `click` listener on
   `map.getContainer()`** and converts coords with `map.mouseEventToLatLng(event)`,
   plus a 250ms dedupe and a `.leaflet-control` guard. Keep this pattern.

3. **Never call `.getBounds()` on a detached Leaflet shape.** It throws
   `can't access property "layerPointToLatLng", this._map is undefined` and unmounts
   React (blank page). `MapController` fits to bounds computed **arithmetically** via
   `circleBounds()` (meters→degrees), not `L.circle(...).getBounds()`.

4. **MapController keeps zoom on Cancel.** It uses `hadStartRef` so the default
   `setView` only runs on first mount; clearing the start point must not reset the view.

5. **Bottom overlay padding.** In `setup` phase `MapController` adds `340px` bottom
   padding to `fitBounds` so the destination isn't hidden behind the setup card;
   other phases use `60px`. Tune the `340` constant if the card's height changes.

6. **Store coordination (side effects between stores).** `appStore`'s
   `completeWalk`/`cancelWalk` call siblings via `useHistoryStore.getState().addWalk()`
   and `useGamificationStore.getState().processWalkCompletion()` at call-time (not
   import-time) — this avoids circular-import issues. `completeWalk`/`cancelWalk` are
   **idempotent-gated on `phase === 'walking'`** to prevent double completion.

7. **GPS / secure context.** On a phone, `navigator.geolocation` is absent unless the
   page is HTTPS or localhost. `gpsStore` distinguishes this (`window.isSecureContext
   === false`) so the UI shows "GPS blocked: needs HTTPS" instead of failing silently
   (Setup and Walking screens render `gpsStore.error`).

8. **`verbatimModuleSyntax` is ON.** Cross-referenced types must use
   `import type { ... }`, and value imports must stay value imports. Mixed type/value
   imports from the same module are fine as two separate statements (e.g. `MapView.tsx`).

9. **Leaflet icon images are avoided.** Custom `L.divIcon`s (CSS classes in
   `index.css`: `.marker-dot`, `.gps-dot`, `.dot-ring`) are used instead of Leaflet's
   default marker PNGs (which 404 under bundlers). `leaflet/dist/leaflet.css` is
   imported in `MapView.tsx`.

## 6. localStorage Schema

| Key | Shape |
|---|---|
| `random-spot-walk-history` | `Walk[]` (completed + cancelled) |
| `random-spot-walk-gamification` | `GamificationState` (`currentStreak`, `bestStreak`, `lastWalkDate`, `achievements[]`) |
| `random-spot-walk-map-style` | `'light' \| 'dark'` |
| `random-spot-walk-active` | `ActiveWalk` (in-progress walk; `null`/absent when none) |

`Walk` / `GamificationState` / `Achievement` / `ActiveWalk` types live in `types/index.ts`.
See `storage.ts` for `try/catch`-wrapped helpers that return safe defaults on corrupt data; `achievements.ts` holds the hard-coded achievement catalog.

### Active-walk persistence (resume after refresh/restart)

The in-progress walk is persisted under `random-spot-walk-active` (via `saveActiveWalk`) when
`startWalk()` runs, and cleared (`clearActiveWalk()`) on `completeWalk` / `cancelWalk` /
`resetToSetup`. `appStore` rehydrates **synchronously at store creation** from `loadActiveWalk()`
so the walking screen (with GPS + timer) resumes with no setup-screen flash. Elapsed time is
not stored — it's recomputed from `startedAt`, so it stays accurate across reloads. `loadActiveWalk`
runs `isValidActiveWalk`, a structural guard so a corrupt/partial payload doesn't resurrect a
broken walk.

## 7. Key Flows

**Setup → generate → walk → complete**
1. Map DOM click / “📍 Use my location” → `appStore.setStartPoint` (clears any dest).
2. Radius, difficulty, optional countdown set in the control card. Changing radius clears dest.
3. **Generate Spot** → `randomPointInCircle(start, radiusKm)` → red `D` marker; **Re-roll** repeats. **Start Walk** → `phase='walking'`, records `startedAt`.
4. `WalkingScreen` computes live distance via `haversineDistance(gps, dest)`; when `<= DIFFICULTY_THRESHOLDS[difficulty]` → `completeWalk()`; if countdown hits 0 → `cancelWalk()`.
5. `completeWalk` builds a `Walk`, saves to history, runs `gamificationStore.processWalkCompletion` (streak = consecutive-day logic; returns newly unlocked achievements → toasts), sets `phase='completed'`.
6. **Cancel** in `WalkingScreen` also saves a `status:'cancelled'` walk and returns to setup.

**Streak logic** (`gamificationStore`): compare `lastWalkDate` (YYYY-MM-DD) to today;
same-day = no change, yesterday = +1, otherwise reset to 1; `bestStreak` = max. Uses local-date formatting (not `toISOString`) to avoid TZ/off-by-one.

## 8. Where to make common changes

- **Add an achievement:** extend `ACHIEVEMENT_DEFINITIONS` + the `conditions` map in `utils/achievements.ts`.
- **Change difficulty thresholds:** `DIFFICULTY_THRESHOLDS` in `types/index.ts`.
- **Adjust map framing:** `MapController` in `MapView.tsx` (padding / `bottomPad` / zoom behavior).
- **Change GPS options:** `gpsStore.startWatching` (`enableHighAccuracy`, `maximumAge`, `timeout`).
- **Add a screen/panel:** mirror existing screens in `components/screens` + `App.tsx` phase switch, or panels via `uiStore.openPanel`.
