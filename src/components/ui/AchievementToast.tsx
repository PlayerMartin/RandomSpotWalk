import type { Achievement } from '../../types';

export function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: Achievement;
  onDismiss: () => void;
}) {
  return (
    <div className="toast-in pointer-events-auto rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 shadow-xl">
      <div className="flex items-center gap-4">
        <span className="text-4xl">🏆</span>
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">
            Achievement unlocked
          </p>
          <p className="text-base font-bold text-gray-900">{achievement.title}</p>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="ml-auto self-start text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
