import { useEffect } from 'react';
import { useGpsStore } from '../stores/gpsStore';

/**
 * Manages the geolocation watch lifecycle. Starts watching when `active` is
 * true, stops when false or on unmount.
 */
export function useGeolocation(active: boolean): void {
  const startWatching = useGpsStore((s) => s.startWatching);
  const stopWatching = useGpsStore((s) => s.stopWatching);

  useEffect(() => {
    if (!active) return;
    startWatching();
    return () => {
      stopWatching();
    };
  }, [active, startWatching, stopWatching]);
}
