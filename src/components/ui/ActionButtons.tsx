import { IconTarget, IconRefresh, IconWalk } from "./icons";

interface ActionButtonsProps {
  hasDest: boolean;
  canStart: boolean;
  onGenerate: () => void;
  onReroll: () => void;
  onStart: () => void;
}

export function ActionButtons({
  hasDest,
  canStart,
  onGenerate,
  onReroll,
  onStart,
}: ActionButtonsProps) {
  if (!hasDest) {
    return (
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canStart}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blaze px-4 py-3.5 text-base font-bold text-white shadow-sm transition active:bg-blaze-deep disabled:bg-line disabled:text-ink-muted disabled:shadow-none"
      >
        <IconTarget size={20} />
        Generate spot
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onReroll}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-bone px-4 py-3.5 text-base font-semibold text-ink active:bg-sand"
      >
        <IconRefresh size={19} />
        Re-roll
      </button>
      <button
        type="button"
        onClick={onStart}
        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-pine px-4 py-3.5 text-base font-bold text-white shadow-sm transition active:bg-pine-deep"
      >
        <IconWalk size={20} />
        Start walk
      </button>
    </div>
  );
}
