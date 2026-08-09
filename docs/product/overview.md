# Overview

A mobile-first web app where a user sets a start point + radius, generates a
**random destination** inside the circle, then physically walks to it while
being tracked via browser GPS. When within the difficulty threshold, the walk
auto-completes; stats/streaks/achievements are stored locally.

**State machine:** `setup → walking → completed`.
No backend, no auth, no accounts.

## Tech Stack (actual)

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 8 (HTTPS-only dev/preview, mkcert) |
| Language | TypeScript (`verbatimModuleSyntax` → `import type`) |
| Maps | react-leaflet v5 + Leaflet 1.9 (OSM light / CartoDB dark) |
| State | Zustand v5 (6 small stores) |
| Styling | Tailwind v4 (`@tailwindcss/vite`) |
| Persistence | localStorage (5 keys + map view) |
| GPS | `navigator.geolocation.watchPosition` (needs secure context) |

**Node version — REQUIRED:** Use **Node 20 LTS**. 

→ For game rules: [product scope](scope.md) · For code structure:
[technical architecture](../technical/architecture.md)
