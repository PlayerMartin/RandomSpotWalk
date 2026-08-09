import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useGpsStore } from '../../stores/gpsStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useTimer } from '../../hooks/useTimer';
import { haversineDistance, formatDistance } from '../../utils/geo';
import { DIFFICULTY_THRESHOLDS } from '../../types';
import type { Difficulty } from '../../types';
import { IconClose, IconFlag, IconTimer } from '../ui/icons';

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
  useGeolocation(true);

  const { elapsed, remaining, isExpired } = useTimer(startedAt, timerSeconds);

  const threshold = DIFFICULTY_THRESHOLDS[difficulty as Difficulty];
  const distance = gps && destPoint ? haversineDistance(gps, destPoint) : null;
  const arrived = distance !== null && distance <= threshold;

  useEffect(() => {
    if (arrived) completeWalk();
  }, [arrived, completeWalk]);

  // Treat countdown expiry as a cancellation
  useEffect(() => {
    if (isExpired) cancelWalk();
  }, [isExpired, cancelWalk]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex flex-col gap-3 px-3 pb-4">
      {/* Waiting for GPS (no error warnings) */}
      {!gps && (
        <div className="pointer-events-auto flex items-center gap-2 self-center rounded-full bg-warn-bg px-4 py-2.5 text-sm font-semibold text-warn-text shadow-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-warn-dot" />
          Waiting for GPS signal…
        </div>
      )}

      <div className="pointer-events-auto rounded-3xl bg-bone/97 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              <IconFlag size={13} className="text-blaze" />
              Distance to spot
            </p>
            <p className="mt-0.5 text-4xl font-extrabold tabular-nums tracking-tight text-pine">
              {distance !== null ? formatDistance(distance) : '—'}
            </p>
            <p className="text-xs text-ink-muted">within {threshold}m of the blaze</p>
          </div>

          <div className="shrink-0 text-right">
            <div className="rounded-xl bg-bone px-3 py-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                Time
              </p>
              <p className="text-xl font-bold tabular-nums tracking-tight text-ink">
                {formatTime(elapsed)}
              </p>
            </div>
            {remaining !== null && (
              <div className="mt-1 flex items-center justify-end gap-1 rounded-xl bg-bone px-3 py-1">
                <IconTimer
                  size={12}
                  className={remaining <= 60 ? 'text-danger-text' : 'text-ink-muted'}
                />
                <p className="text-lg font-bold tabular-nums tracking-tight">
                  <span
                    className={remaining <= 60 ? 'text-danger-text' : 'text-ink'}
                  >
                    {formatTime(remaining)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={cancelWalk}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-bone px-4 py-3 text-base font-semibold text-ink active:bg-danger-bg active:text-danger-text"
        >
          <IconClose size={18} />
          Cancel walk
        </button>
      </div>
    </div>
  );
}
