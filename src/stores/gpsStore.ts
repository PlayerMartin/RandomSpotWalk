import { create } from 'zustand';
import type { LatLng } from '../types';

interface GpsState {
  position: LatLng | null;
  error: string | null;
  watching: boolean;
  watchId: number | null;
  startWatching: () => void;
  stopWatching: () => void;
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
      // On mobile, geolocation is only exposed in a secure context (HTTPS
      // or localhost). Plain http:// over the LAN blocks it silently.
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

  setError: (msg) => set({ error: msg }),
}));
