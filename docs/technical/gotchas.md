# Gotchas — counterintuitive / fragile implementation notes (READ)

These parts look fine but are easy to break. Read before modifying.

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

5. **Bottom overlay padding.** Bottom padding keeps fitted points visible
   **above** the bottom overlay panels (trimming it hides the destination
   behind the card). `MapController` uses `400px` in `setup` (control card,
   ~340px tall), `280px` in `walking`, and `60px` in `completed`, with `8px`
   left/right and `60px` top. On portrait, zoom is width-limited, so the
   bottom padding can be generous without zooming out — keep the side padding
   tight instead. Tune the per-phase constants if a card's height changes.

6. **Store coordination (side effects between stores).** `appStore`'s
   `completeWalk`/`cancelWalk` call siblings via `useHistoryStore.getState().addWalk()`
   and `useGamificationStore.getState().processWalkCompletion()` at call-time (not
   import-time) — this avoids circular-import issues. `completeWalk`/`cancelWalk` are
   **idempotent-gated on `phase === 'walking'`** to prevent double completion.

7. **GPS / secure context.** On a phone, `navigator.geolocation` is absent unless the
   page is HTTPS or localhost. `gpsStore` distinguishes this (`window.isSecureContext
   === false`) so the UI shows "GPS blocked: needs HTTPS" instead of failing silently
   (Setup and Walking screens render `gpsStore.error`).

8. **Phone lock → frozen location (two-part fix).** When the phone is locked, the
   browser suspends the tab. On unlock it can resume with a stale on-screen GPS dot
   even though position data is actually flowing (the walk still auto-completes at the
   destination — evidence the acquisition is fine and only the overlay rendering is
   stale). Two guards cover this:
   - `MapVisibilityFix` (in `MapView.tsx`) calls `map.invalidateSize()` whenever the
     page returns to `visibilityState === 'visible'` (or `pageshow` for bfcache),
     forcing Leaflet to redraw markers at their current coordinates.
   - `useGeolocation` calls `gpsStore.restartWatching()` on the same visibility events:
     it clears the suspended watch, seeds a fresh one-shot fix via
     `requestCurrentPosition` (which runs independently of the watch), then re-registers
     the watch — so the stored position value itself can't stay stuck.

9. **`verbatimModuleSyntax` is ON.** Cross-referenced types must use
   `import type { ... }`, and value imports must stay value imports. Mixed type/value
   imports from the same module are fine as two separate statements (e.g. `MapView.tsx`).

10. **Leaflet icon images are avoided.** Custom `L.divIcon`s (CSS classes in
    `index.css`: `.marker-dot`, `.gps-dot`, `.dot-ring`) are used instead of Leaflet's
    default marker PNGs (which 404 under bundlers). `leaflet/dist/leaflet.css` is
    imported in `MapView.tsx`.
