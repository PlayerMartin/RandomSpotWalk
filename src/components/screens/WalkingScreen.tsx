import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useGpsStore } from '../../stores/gpsStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useTimer } from '../../hooks/useTimer';
import { haversineDistance, formatDistance } from '../../utils/geo';
import { DIFFICULTY_THRESHOLDS } from '../../types';
import type { Difficulty } from '../../types';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WalkingScreen() {
  const startedAt = useAppStore((s) => s.startedAt);
  const timerSeconds = useAppStore((s) => s.timerSeconds);
  const destPoint = useAppStore((s) => s.destPoint);
  const difficulty = useAppStore((s) => s.difficulty);
  const completeWalk = useAppStore((s) => s.completeWalk);
  const cancelWalk = useAppStore((s) => s.cancelWalk);

  const gps = useGpsStore((s) => s.position);
  const error = useGpsStore((s) => s.error);
  useGeolocation(true);

  const { elapsed, remaining, isExpired } = useTimer(startedAt, timerSeconds);

  const threshold = DIFFICULTY_THRESHOLDS[difficulty as Difficulty];
  const distance = gps && destPoint ? haversineDistance(gps, destPoint) : null;
  const arrived = distance !== null && distance <= threshold;

  // Auto-complete on arrival
  useEffect(() => {
    if (arrived) completeWalk();
  }, [arrived, completeWalk]);

  // Treat countdown expiry as a cancellation
  useEffect(() => {
    if (isExpired) cancelWalk();
  }, [isExpired, cancelWalk]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex flex-col gap-3 px-3 pb-4">
      {/* GPS status */}
      {!gps && (
        <div className="pointer-events-auto self-center">
          {error ? (
            <div className="max-w-xs rounded-xl bg-red-500/95 px-4 py-2 text-center text-xs font-semibold leading-relaxed text-white shadow-lg">
              ⚠️ {error}
            </div>
          ) : (
            <div className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Waiting for GPS signal…
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-auto rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Distance to spot
            </p>
            <p className="text-4xl font-black tabular-nums text-gray-900">
              {distance !== null ? formatDistance(distance) : '—'}
            </p>
            <p className="text-xs text-gray-400">
              Target: within {threshold}m
            </p>
          </div>

          <div className="text-right">
            <div className="rounded-xl bg-gray-100 px-4 py-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Time</p>
              <p className="text-xl font-bold tabular-nums text-gray-800">
                {formatTime(elapsed)}
              </p>
            </div>
            {remaining !== null && (
              <div className="mt-1 rounded-xl bg-gray-100 px-4 py-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                  Left
                </p>
                <p className={`text-lg font-bold tabular-nums ${remaining <= 60 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatTime(remaining)}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={cancelWalk}
          className="mt-4 w-full rounded-xl border-2 border-red-300 bg-white px-4 py-3 text-base font-bold text-red-600 active:bg-red-50"
        >
          ✕ Cancel Walk
        </button>
      </div>
    </div>
  );
}
