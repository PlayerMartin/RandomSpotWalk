import { useGamificationStore } from '../../stores/gamificationStore';
import { useUiStore } from '../../stores/uiStore';
import type { Achievement } from '../../types';
import { IconClose, IconTrophy, IconLock, IconFlame, IconCrown } from '../ui/icons';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const locked = !achievement.unlockedAt;
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        locked ? 'border-line bg-bone opacity-60' : 'border-blaze/30 bg-blaze/5'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          locked ? 'bg-sand text-ink-muted' : 'bg-blaze text-white'
        }`}
      >
        {locked ? <IconLock size={17} /> : <IconTrophy size={17} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-bold ${locked ? 'text-ink-muted' : 'text-ink'}`}>
          {achievement.title}
        </p>
        <p className="text-xs text-ink-muted">{achievement.description}</p>
      </div>
      {achievement.unlockedAt && (
        <span className="shrink-0 text-[11px] font-semibold text-blaze-deep">
          {formatDate(achievement.unlockedAt)}
        </span>
      )}
    </div>
  );
}

export function GamificationPanel() {
  const { currentStreak, bestStreak, achievements } = useGamificationStore();
  const closePanel = useUiStore((s) => s.closePanel);
  const unlocked = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="absolute inset-x-0 bottom-0 z-[800] flex justify-center">
      <div className="slide-up flex max-h-[75vh] w-full max-w-md flex-col rounded-t-3xl bg-bone shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-extrabold tracking-tight text-pine">
            Achievements
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

        <div className="grid grid-cols-3 gap-2 px-4 py-4">
          <div className="rounded-2xl bg-moss-soft p-3 text-center">
            <IconFlame size={20} className="mx-auto text-blaze" />
            <p className="mt-1 text-[11px] font-bold uppercase text-ink-muted">Current</p>
            <p className="text-2xl font-extrabold tabular-nums text-pine">{currentStreak}</p>
          </div>
          <div className="rounded-2xl bg-sand p-3 text-center">
            <IconCrown size={20} className="mx-auto text-moss" />
            <p className="mt-1 text-[11px] font-bold uppercase text-ink-muted">Best</p>
            <p className="text-2xl font-extrabold tabular-nums text-pine">{bestStreak}</p>
          </div>
          <div className="rounded-2xl bg-sand p-3 text-center">
            <IconTrophy size={20} className="mx-auto text-blaze" />
            <p className="mt-1 text-[11px] font-bold uppercase text-ink-muted">Unlocked</p>
            <p className="text-2xl font-extrabold tabular-nums text-pine">
              {unlocked}/{achievements.length}
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
