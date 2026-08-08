import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useUiStore } from '../../stores/uiStore';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementToast } from '../ui/AchievementToast';
import { DIFFICULTY_LABELS } from '../../types';
import type { Walk } from '../../types';
import {
  IconFlag,
  IconFlame,
  IconCrown,
  IconWalk,
  IconHistory,
} from '../ui/icons';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CompletionScreen() {
  const completedWalk = useAppStore((s) => s.completedWalk);
  const resetToSetup = useAppStore((s) => s.resetToSetup);
  const openPanel = useUiStore((s) => s.openPanel);

  const { currentStreak, bestStreak } = useGamificationStore();
  const { newlyUnlocked, clearNewlyUnlocked } = useAchievements();

  const walk = completedWalk as Walk | null;

  // Auto-dismiss toasts after 4s
  useEffect(() => {
    if (newlyUnlocked.length === 0) return;
    const t = setTimeout(clearNewlyUnlocked, 4000);
    return () => clearTimeout(t);
  }, [newlyUnlocked, clearNewlyUnlocked]);

  if (!walk) return null;

  const remaining =
    walk.timerSetSeconds !== null
      ? Math.max(0, walk.timerSetSeconds - walk.elapsedSeconds)
      : null;

  return (
    <div className="absolute inset-0 z-[600] flex flex-col overflow-y-auto bg-bone backdrop-blur">
      {/* Achievement toasts */}
      {newlyUnlocked.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[700] flex flex-col items-center gap-2 px-4">
          {newlyUnlocked.map((a) => (
            <AchievementToast key={a.id} achievement={a} onDismiss={clearNewlyUnlocked} />
          ))}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-7 px-6 py-10 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-sand">
          <div className="absolute inset-0 rotate-45 rounded-[20px] bg-sand" />
          <IconFlag size={40} className="relative text-blaze" />
        </div>

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-pine">
            Spot reached
          </h1>
          <p className="mt-1.5 text-sm font-medium text-ink-muted">
            {DIFFICULTY_LABELS[walk.difficulty]} · {walk.radiusKm} km radius
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-sand p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              Elapsed
            </p>
            <p className="mt-0.5 text-3xl font-extrabold tabular-nums tracking-tight text-ink">
              {formatTime(walk.elapsedSeconds)}
            </p>
          </div>
          <div className="rounded-2xl bg-sand p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
              {remaining !== null ? 'Timer left' : 'Best streak'}
            </p>
            <p className="mt-0.5 text-3xl font-extrabold tabular-nums tracking-tight text-ink">
              {remaining !== null ? (
                formatTime(remaining)
              ) : (
                <span className="inline-flex items-center gap-2">
                  <IconCrown size={26} className="text-moss" />
                  {bestStreak}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-10 rounded-2xl bg-moss-soft px-4 py-4 text-pine">
          <div className="flex items-center gap-2.5">
            <IconFlame size={26} className="text-blaze" />
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                Streak
              </p>
              <p className="text-xl font-extrabold leading-tight tabular-nums">
                {currentStreak} day{currentStreak === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <IconCrown size={26} className="text-ink-muted" />
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">
                Best
              </p>
              <p className="text-xl font-extrabold leading-tight tabular-nums">
                {bestStreak}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={resetToSetup}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pine px-4 py-3.5 text-base font-bold text-white shadow-sm transition active:bg-pine-deep"
          >
            <IconWalk size={20} />
            Start new walk
          </button>
          <button
            type="button"
            onClick={() => openPanel('history')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-bone px-4 py-3.5 text-base font-semibold text-ink active:bg-sand"
          >
            <IconHistory size={18} />
            View history
          </button>
        </div>
      </div>
    </div>
  );
}
