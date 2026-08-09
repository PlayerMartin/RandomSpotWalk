import { IconTimer } from "./icons";

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
    <div className="flex items-center gap-3 rounded-xl border border-line bg-bone px-3.5 py-2.5">
      <IconTimer
        size={18}
        className={enabled ? "text-pine" : "text-ink-muted"}
      />
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className="flex flex-1 items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-sm font-semibold text-ink">
            Countdown timer
          </span>
          <span className="block text-[11px] font-normal text-ink-muted">
            Walk ends when it runs out
          </span>
        </span>
        <span
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            enabled ? "bg-pine" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </span>
      </button>
      {enabled && (
        <div className="relative w-20 shrink-0">
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              onChange(Number.isFinite(v) && v > 0 ? v : 1);
            }}
            className="w-full rounded-lg border border-line bg-bone py-1.5 pl-2.5 pr-9 text-sm font-bold text-ink outline-none focus:border-pine"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
            min
          </span>
        </div>
      )}
    </div>
  );
}
