# Random Spot Walk

Pick a start point and a radius on the map, generate a random destination inside the circle, then walk there. GPS tracks you and the walk completes automatically when you get close enough.

Built with React, TypeScript, Vite, Tailwind CSS, and Leaflet (OpenStreetMap). No backend — everything is stored locally.

## Scripts

```bash
npm install
npm run dev        # HTTPS dev server (needs .certs/, see below)
npm run build      # typecheck + production build
npm run preview    # HTTPS preview of the build
```

## Development notes

- The dev/preview servers are **HTTPS-only**, which is required for the browser GPS API on a phone. Generate certs with [mkcert](https://github.com/FiloSottile/mkcert) into `.certs/` before running `npm run dev`.
- Node 20 LTS is recommended (see `docs/impl-notes.md`).
