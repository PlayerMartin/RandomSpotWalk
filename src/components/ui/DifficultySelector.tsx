import type { Difficulty } from "../../types";
import { DIFFICULTY_LABELS, DIFFICULTY_THRESHOLDS } from "../../types";

const ORDER: Difficulty[] = ["easy", "medium", "hard"];

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        How close must you get?
      </p>
      <div className="flex gap-1.5">
        {ORDER.map((d) => {
          const active = d === value;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(d)}
              className={`flex-1 rounded-xl border px-3 py-2 text-center transition ${
                active
                  ? "border-pine bg-pine text-white"
                  : "border-line bg-bone text-ink active:bg-sand"
              }`}
            >
              <span className="block text-sm font-bold leading-tight">
                {DIFFICULTY_LABELS[d]}
              </span>
              <span
                className={`block text-[11px] font-medium leading-tight ${
                  active ? "text-bone/70" : "text-ink-muted"
                }`}
              >
                {DIFFICULTY_THRESHOLDS[d]}m
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
