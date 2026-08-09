import { create } from 'zustand';
import type { LatLng } from '../types';

interface GpsState {
  position: LatLng | null;
  error: string | null;
  watching: boolean;
  watchId: number | null;
  startWatching: () => void;
  stopWatching: () => void;
  restartWatching: () => void;
  requestCurrentPosition: (
    onSuccess?: (pos: LatLng) => void,
    onError?: (err: GeolocationPositionError | null) => void,
  ) => void;
  setError: (msg: string | null) => void;
}

export const useGpsStore = create<GpsState>((set, get) => ({
  position: null,
  error: null,
  watching: false,
  watchId: null,

  startWatching: () => {
    if (get().watching) return;
    if (!('geolocation' in navigator)) {
      // Mobile needs a secure context (HTTPS/localhost) — plain http blocks it silently.
      set({
        error:
          window.isSecureContext === false
            ? 'GPS blocked: mobile browsers need HTTPS. Open this app via https:// (or localhost).'
            : 'Geolocation is not supported on this device/browser.',
      });
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        set({
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            'Location permission denied. Allow location access (check browser/site settings), or tap the map to set your start point.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location unavailable. Try again or tap the map manually.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Go near a window or outside for a GPS fix.';
        }
        set({ error: msg });
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    set({ watching: true, watchId });
  },

  stopWatching: () => {
    const { watchId, watching } = get();
    if (!watching) return;
    if (watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
    set({ watching: false, watchId: null });
  },

  // Mobile browsers suspend geolocation callbacks while the tab is hidden; on
  // re-show, clear the watch, seed a one-shot fix, then re-register — so the
  // stored position can't stay stuck on the pre-sleep value (gotchas.md #8).
  restartWatching: () => {
    const { watchId, watching } = get();
    if (watching && watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId);
    }
    set({ watching: false, watchId: null });
    get().requestCurrentPosition();
    get().startWatching();
  },

  // One-shot request for "Use my location": ALWAYS attempts a fresh fix (fires
  // the permission prompt) even while a watch is active, so the button works
  // right after enabling GPS — see docs/technical/flows.md.
  requestCurrentPosition: (onSuccess, onError) => {
    if (!('geolocation' in navigator)) {
      set({
        error:
          window.isSecureContext === false
            ? 'Location is blocked: this app needs HTTPS. Open it via https:// (or localhost).'
            : 'This device/browser does not support geolocation.',
      });
      onError?.(null);
      return;
    }
    set({ error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        set({ position: p, error: null });
        onSuccess?.(p);
      },
      (err) => {
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            'Location access is blocked. Allow location for this site in your browser settings, then try again.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg =
            'GPS is off. Turn on Location Services (your device\'s location toggle), then tap Use my location again.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        set({ error: msg });
        onError?.(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    );
  },

  setError: (msg) => set({ error: msg }),
}));
