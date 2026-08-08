import { useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import { useUiStore } from '../../stores/uiStore';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementToast } from '../ui/AchievementToast';
import { DIFFICULTY_LABELS } from '../../types';
import type { Walk } from '../../types';

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
    <div className="absolute inset-0 z-[600] flex flex-col overflow-y-auto bg-white/95 backdrop-blur">
      {/* Achievement toasts */}
      {newlyUnlocked.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[700] flex flex-col items-center gap-2 px-4">
          {newlyUnlocked.map((a) => (
            <AchievementToast key={a.id} achievement={a} onDismiss={clearNewlyUnlocked} />
          ))}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center">
        <div className="text-6xl">🎉</div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Walk Complete!</h1>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            {DIFFICULTY_LABELS[walk.difficulty]} · {walk.radiusKm} km radius
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gray-100 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Elapsed</p>
            <p className="text-3xl font-black tabular-nums text-gray-900">
              {formatTime(walk.elapsedSeconds)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-100 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
              {remaining !== null ? 'Timer Left' : 'Best Streak'}
            </p>
            <p className="text-3xl font-black tabular-nums text-gray-900">
              {remaining !== null ? formatTime(remaining) : `🔥${bestStreak}`}
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-8 rounded-2xl bg-amber-50 p-4 text-amber-700">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide">Current streak</p>
            <p className="text-2xl font-black">🔥 {currentStreak} day{currentStreak === 1 ? '' : 's'}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide">Best</p>
            <p className="text-2xl font-black">👑 {bestStreak}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={resetToSetup}
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-base font-bold text-white shadow-lg active:bg-green-700"
          >
            🚶 Start New Walk
          </button>
          <button
            type="button"
            onClick={() => openPanel('history')}
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-semibold text-gray-700 active:bg-gray-100"
          >
            📜 View History
          </button>
        </div>
      </div>
    </div>
  );
}
