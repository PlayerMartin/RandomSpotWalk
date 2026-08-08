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
        className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white shadow-lg transition active:bg-blue-700 disabled:opacity-40 disabled:active:bg-blue-600"
      >
        🎯 Generate Spot
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onReroll}
        className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base font-semibold text-gray-700 active:bg-gray-100"
      >
        🔄 Re-roll
      </button>
      <button
        type="button"
        onClick={onStart}
        className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-base font-bold text-white shadow-lg transition active:bg-green-700"
      >
        🚶 Start Walk
      </button>
    </div>
  );
}
