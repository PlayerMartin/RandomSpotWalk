import { useGamificationStore } from '../../stores/gamificationStore';
import { useUiStore } from '../../stores/uiStore';
import type { Achievement } from '../../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const locked = !achievement.unlockedAt;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 ${
        locked ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <span className="text-xl">{locked ? '🔒' : '🏆'}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${locked ? 'text-gray-500' : 'text-gray-900'}`}>
          {achievement.title}
        </p>
        <p className="text-xs text-gray-500">{achievement.description}</p>
      </div>
      {achievement.unlockedAt && (
        <span className="text-[11px] font-semibold text-amber-600">
          {formatDate(achievement.unlockedAt)}
        </span>
      )}
    </div>
  );
}

export function GamificationPanel() {
  const { currentStreak, bestStreak, achievements } = useGamificationStore();
  const closePanel = useUiStore((s) => s.closePanel);

  return (
    <div className="absolute inset-x-0 bottom-0 z-[800] flex justify-center">
      <div className="slide-up flex max-h-[75vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-3 px-5 py-4">
          <div className="flex-1 rounded-2xl bg-amber-50 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-amber-500">Current</p>
            <p className="text-2xl font-black text-amber-700">🔥 {currentStreak}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-indigo-50 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-indigo-500">Best</p>
            <p className="text-2xl font-black text-indigo-700">👑 {bestStreak}</p>
          </div>
          <div className="flex-1 rounded-2xl bg-green-50 p-3 text-center">
            <p className="text-[11px] font-bold uppercase text-green-500">Unlocked</p>
            <p className="text-2xl font-black text-green-700">
              {achievements.filter((a) => a.unlockedAt).length}/{achievements.length}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {achievements.map((a) => (
            <AchievementRow key={a.id} achievement={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
