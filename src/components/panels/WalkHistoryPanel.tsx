import { useState } from 'react';
import { useHistoryStore } from '../../stores/historyStore';
import { useUiStore } from '../../stores/uiStore';
import { DIFFICULTY_LABELS } from '../../types';
import type { Walk } from '../../types';
import { IconClose, IconWalk, IconTrash, IconFlag } from '../ui/icons';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function WalkRow({ walk }: { walk: Walk }) {
  const cancelled = walk.status === 'cancelled';
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
        cancelled ? 'border-line bg-bone' : 'border-moss/40 bg-moss-soft/60'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            cancelled ? 'bg-sand text-ink-muted' : 'bg-pine text-white'
          }`}
        >
          {cancelled ? <IconClose size={15} /> : <IconFlag size={15} />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-ink">
              {cancelled ? 'Cancelled' : 'Completed'}
            </span>
            <span className="rounded bg-bone px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-muted">
              {DIFFICULTY_LABELS[walk.difficulty]}
            </span>
            {walk.radiusKm >= 10 && (
              <span className="rounded bg-bone px-1.5 py-0.5 text-[10px] font-bold text-blaze-deep">
                {walk.radiusKm} km
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-muted">
            {walk.destinationPoint.lat.toFixed(4)},{' '}
            {walk.destinationPoint.lng.toFixed(4)}
          </p>
        </div>
      </div>
      <div className="ml-3 text-right">
        <p className="text-sm font-bold tabular-nums text-ink">
          {formatTime(walk.elapsedSeconds)}
        </p>
        <p className="text-[11px] text-ink-muted">{formatDate(walk.completedAt)}</p>
      </div>
    </div>
  );
}

export function WalkHistoryPanel() {
  const walks = useHistoryStore((s) => s.walks);
  const clear = useHistoryStore((s) => s.clear);
  const closePanel = useUiStore((s) => s.closePanel);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="absolute inset-x-0 bottom-0 z-[800] flex justify-center">
      <div className="slide-up flex max-h-[75vh] w-full max-w-md flex-col rounded-t-3xl bg-bone shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-pine">
            Walk history
          </h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sand text-ink-muted active:bg-line"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {walks.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-ink-muted">
                <IconWalk size={28} />
              </span>
              <p className="max-w-[220px] text-sm text-ink-muted">
                No walks yet. Set a spot and go plant your flag.
              </p>
            </div>
          ) : (
            walks.map((w) => <WalkRow key={w.id} walk={w} />)
          )}
        </div>

        {walks.length > 0 && (
          <div className="border-t border-line px-4 py-3">
            {confirming ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                  className="flex-1 rounded-xl bg-blaze px-4 py-2.5 text-sm font-bold text-white active:bg-blaze-deep"
                >
                  Confirm clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink active:bg-sand"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blaze/40 px-4 py-2.5 text-sm font-semibold text-blaze-deep active:bg-red-50"
              >
                <IconTrash size={16} />
                Clear history
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
