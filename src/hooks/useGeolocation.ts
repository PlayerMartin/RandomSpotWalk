import { useEffect } from 'react';
import { useGpsStore } from '../stores/gpsStore';

/**
 * Manages the GPS watch lifecycle: start/stop with `active`, and re-establish
 * GPS when the tab re-focuses (phone lock) — see docs/technical/gotchas.md #8.
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
