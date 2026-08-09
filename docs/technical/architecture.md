# Architecture

## Project Structure

```
src/
├── main.tsx                    # ReactDOM entry (NO StrictMode)
├── App.tsx                     # Shell: MapView + header + per-phase screen + panels
├── index.css                   # Tailwind + Leaflet/marker/toast/panel CSS
├── types/index.ts              # All interfaces + DIFFICULTY_THRESHOLDS / labels
├── utils/
│   ├── geo.ts                  # haversineDistance, randomPointInCircle, circleBounds, formatDistance
│   ├── achievements.ts         # ACHIEVEMENT_DEFINITIONS + checkNewAchievements
│   └── storage.ts              # load/save for walks, gamification, theme, view, active, setup
├── stores/
│   ├── appStore.ts             # phase machine + walk config/result + action coordination
│   ├── gpsStore.ts             # watchPosition lifecycle + error strings
│   ├── historyStore.ts         # walks list (persisted); addWalk/load/clear/completedCount
│   ├── gamificationStore.ts    # streaks + achievements; processWalkCompletion
│   ├── settingsStore.ts        # map theme + last viewport (persisted)
│   └── uiStore.ts              # which panel is open (history | gamification | null)
├── hooks/
│   ├── useGeolocation.ts       # start/stop watch tied to `active`
│   ├── useTimer.ts             # date-based elapsed + countdown (tab-sleep safe)
│   └── useAchievements.ts      # reads appStore.newlyUnlocked + clear
└── components/
    ├── MapView.tsx             # shared map: container, click capture, controller, overlays
    ├── MapThemeToggle.tsx      # fixed top-right theme flip
    ├── screens/                # SetupScreen, WalkingScreen, CompletionScreen
    ├── panels/                 # WalkHistoryPanel, GamificationPanel (slide-up drawers)
    └── ui/                     # DifficultySelector, RadiusInput, TimerToggle, ActionButtons, AchievementToast, icons
```

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand v5 | Minimal boilerplate, selector re-renders, no provider nesting |
| Folder structure | Type-based (flat) | Small project — don't over-split |
| Map instance | Single shared `<MapView>` | State preserved across screen transitions |
| Timer | Date-based (wall clock) | Accurate, survives tab sleep, no drift |
| Styling | Tailwind v4 | Utility-first, rapid iteration |

## Store Inventory

| Store | Purpose |
|---|---|
| `appStore` | Phase machine + walk config/result; coordinates side effects |
| `gpsStore` | Geolocation watch lifecycle + human-readable error strings |
| `historyStore` | Persisted walk list |
| `gamificationStore` | Streaks + achievements, persisted |
| `settingsStore` | Map theme + last viewport, persisted |
| `uiStore` | Which bottom panel is open |

## Component Tree

`App` → `MapView` (shared, always mounted) + `Screen` (per phase) +
`MapThemeToggle` + `Panel` (history/gamification). Screens render their own
overlays *inside* `MapView` so the single map instance survives phase changes.

## Hook Inventory

| Hook | Description |
|---|---|
| `useGeolocation` | Start/stop GPS watch tied to `active`; restart on visibility |
| `useTimer` | Date-based elapsed + optional countdown (survives tab sleep) |
| `useAchievements` | Reads `newlyUnlocked` from appStore + clears after toasts |

→ [gotchas](gotchas.md) · [flows](flows.md) · [edits](../reference/edits.md)
