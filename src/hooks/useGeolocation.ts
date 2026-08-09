import { useEffect } from 'react';
import { useGpsStore } from '../stores/gpsStore';

/**
 * Manages the geolocation watch lifecycle. Starts watching when `active` is
 * true, stops when false or on unmount. Also re-establishes GPS when the tab
 * returns to the foreground (phone unlock), because mobile browsers suspend
 * geolocation callbacks while hidden and a stale watch can leave the location
 * frozen on the pre-sleep value.
 */
export function useGeolocation(active: boolean): void {
  const startWatching = useGpsStore((s) => s.startWatching);
  const stopWatching = useGpsStore((s) => s.stopWatching);
  const restartWatching = useGpsStore((s) => s.restartWatching);

  useEffect(() => {
    if (!active) return;
    startWatching();

    const onVisible = () => {
      if (document.visibilityState === 'visible') restartWatching();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible); // bfcache back/forward restore

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
      stopWatching();
    };
  }, [active, startWatching, stopWatching, restartWatching]);
}
