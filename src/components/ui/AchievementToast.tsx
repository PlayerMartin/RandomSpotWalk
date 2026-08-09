import type { Achievement } from "../../types";
import { IconTrophy, IconClose } from "./icons";

export function AchievementToast({
  achievement,
  onDismiss,
}: {
  achievement: Achievement;
  onDismiss: () => void;
}) {
  return (
    <div className="toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-blaze/30 bg-bone px-4 py-3 shadow-xl">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blaze text-white">
        <IconTrophy size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-blaze-deep">
          Achievement unlocked
        </p>
        <p className="text-sm font-bold text-ink">{achievement.title}</p>
        <p className="text-xs text-ink-muted">{achievement.description}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 self-start text-ink-muted hover:text-ink"
      >
        <IconClose size={16} />
      </button>
    </div>
  );
}
