# Key Flows

## Setup → generate → walk → complete

1. Map DOM click / "Use my location" → `appStore.setStartPoint` (clears any dest).
2. Radius, difficulty, optional countdown set in the control card. Changing radius
   clears dest.
3. **Generate Spot** → `randomPointInCircle(start, radiusKm)` → red `D` marker;
   **Re-roll** repeats. **Start Walk** → `phase='walking'`, records `startedAt`.
4. `WalkingScreen` computes live distance via `haversineDistance(gps, dest)`; when
   `<= DIFFICULTY_THRESHOLDS[difficulty]` → `completeWalk()`; if countdown hits 0 →
   `cancelWalk()`.
5. `completeWalk` builds a `Walk`, saves to history, runs
   `gamificationStore.processWalkCompletion` (streak = consecutive-day logic; returns
   newly unlocked achievements → toasts), sets `phase='completed'`.
6. **Cancel** in `WalkingScreen` also saves a `status:'cancelled'` walk and returns
   to setup.

**"Use my location" button** (Setup): if a GPS fix is already known it's placed
directly and skips the prompt (so toggling GPS off later doesn't surface a stale
warning); otherwise it runs a fresh one-shot request that fires the browser's
permission prompt even while a watch is active, showing a "Locating…" state first.

## Streak logic (`gamificationStore`)

Compare `lastWalkDate` (YYYY-MM-DD) to today: same-day = no change, yesterday = +1,
otherwise reset to 1; `bestStreak` = max. Uses local-date formatting (not
`toISOString`) to avoid TZ/off-by-one.

## Cancel flow

`cancelWalk` is idempotent-gated on `phase === 'walking'`; saves a cancelled `Walk`
and returns to setup (clears active-walk record, resets `completedWalk`/toasts).

## Store coordination pattern

`appStore` calls siblings via `useXxxStore.getState().action()` at **call-time**
(not import-time) to avoid circular imports. `completeWalk` coordinates
`historyStore.addWalk` + `gamificationStore.processWalkCompletion` before setting
`phase='completed'`.

→ [edits](../reference/edits.md)
