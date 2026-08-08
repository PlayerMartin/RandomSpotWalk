export function TimerToggle({
  enabled,
  minutes,
  onToggle,
  onChange,
}: {
  enabled: boolean;
  minutes: number;
  onToggle: (enabled: boolean) => void;
  onChange: (minutes: number) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onToggle(e.target.checked)}
        className="h-5 w-5 accent-blue-600"
      />
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className="text-sm font-semibold text-gray-700">
          Countdown timer
          <span className="block text-[11px] font-normal text-gray-400">
            Walk expires when it runs out
          </span>
        </span>
        {enabled && (
          <div className="relative w-24">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onChange(Number.isFinite(v) && v > 0 ? v : 1);
              }}
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-1.5 pl-3 pr-8 text-base font-semibold text-gray-800 outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              min
            </span>
          </div>
        )}
      </div>
    </label>
  );
}
