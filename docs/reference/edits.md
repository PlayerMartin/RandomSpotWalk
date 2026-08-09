# Where to Change X — Lookup Table

| Task | File(s) |
|---|---|
| Add an achievement | `utils/achievements.ts` (`ACHIEVEMENT_DEFINITIONS` + `conditions` map) |
| Change difficulty thresholds | `DIFFICULTY_THRESHOLDS` in `types/index.ts` |
| Adjust map framing | `MapController` in `MapView.tsx` (padding / `bottomPad` / zoom behavior) |
| Change GPS options | `gpsStore.startWatching` (`enableHighAccuracy`, `maximumAge`, `timeout`) |
| Add a screen/panel | New component + `App.tsx` phase switch (screens) or `uiStore.openPanel` (panels) |
| Add a localStorage key | `utils/storage.ts` (KEYS + load/save) + `types/index.ts` |
| Change map tiles | `TileLayer` URL in `MapView.tsx` |
| Change overlay markers/circles | `MapView.tsx` overlay components (`SetupOverlays`, `WalkingOverlays`, `CompletedOverlays`) |
| Change streak/achievement rules | `gamificationStore.processWalkCompletion` + `checkNewAchievements` |
| Change timer behavior | `hooks/useTimer.ts` + `WalkingScreen` countdown handling |
| Change toast styling | `ui/AchievementToast.tsx` + `.toast` CSS in `index.css` |

→ Full details in [architecture](../technical/architecture.md) and
[flows](../technical/flows.md)
