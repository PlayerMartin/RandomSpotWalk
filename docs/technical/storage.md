# Storage — localStorage Schema & Persistence

All helpers are in `utils/storage.ts` (`try/catch`-wrapped, returning safe
defaults on corrupt data). Type definitions live in
[`src/types/index.ts`](../../src/types/index.ts).

## Keys

| Key | Shape |
|---|---|
| `random-spot-walk-history` | `Walk[]` (completed + cancelled) |
| `random-spot-walk-gamification` | `GamificationState` (`currentStreak`, `bestStreak`, `lastWalkDate`, `achievements[]`) |
| `random-spot-walk-map-style` | `'light' \| 'dark'` |
| `random-spot-walk-active` | `ActiveWalk` (in-progress walk; `null`/absent when none) |
| `random-spot-walk-setup` | `SetupState` (setup-screen draft; absent after a walk starts) |
| `random-spot-walk-map-view` | `MapViewState` (last viewport) |

## Active-walk persistence (resume after refresh/restart)

The in-progress walk is persisted under `random-spot-walk-active` (via
`saveActiveWalk`) when `startWalk()` runs, and cleared (`clearActiveWalk()`) on
`completeWalk` / `cancelWalk` / `resetToSetup`. `appStore` rehydrates
**synchronously at store creation** from `loadActiveWalk()` so the walking screen
(with GPS + timer) resumes with no setup-screen flash. Elapsed time is not stored
— it's recomputed from `startedAt`, so it stays accurate across reloads.
`loadActiveWalk` runs `isValidActiveWalk`, a structural guard so a
corrupt/partial payload doesn't resurrect a broken walk.

## Setup-draft persistence (resume mid-setup)

The setup screen's state (start point, generated destination, radius, difficulty,
countdown) is persisted under `random-spot-walk-setup` (`SetupState`) **on every
change while `phase === 'setup'`** — `appStore` registers a `useAppStore.subscribe`
listener that calls `saveSetup(...)` and skips any other phase. At store creation,
when there's **no** active walk, `loadSetup()` hydrates the draft so a
refresh/restart mid-setup keeps the user's work (otherwise it starts from
defaults). The draft is cleared in `startWalk()` (`clearSetup()`) once it's
consumed, so finishing a walk returns to fresh defaults rather than resurrecting
stale config. `loadSetup` runs `isValidSetupState`, mirroring `isValidActiveWalk`.

→ Type definitions in [`src/types/index.ts`](../../src/types/index.ts)
