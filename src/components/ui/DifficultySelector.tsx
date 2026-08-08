import type { Difficulty } from '../../types';
import { DIFFICULTY_LABELS, DIFFICULTY_THRESHOLDS } from '../../types';

const ORDER: Difficulty[] = ['easy', 'medium', 'hard'];

const COLORS: Record<Difficulty, string> = {
  easy: 'data-[active=true]:bg-green-500 data-[active=true]:border-green-500',
  medium: 'data-[active=true]:bg-amber-500 data-[active=true]:border-amber-500',
  hard: 'data-[active=true]:bg-red-500 data-[active=true]:border-red-500',
};

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  return (
    <div className="flex gap-2">
      {ORDER.map((d) => {
        const active = d === value;
        return (
          <button
            key={d}
            type="button"
            data-active={active}
            onClick={() => onChange(d)}
            className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors border-gray-200 bg-white text-gray-700 ${COLORS[d]}`}
          >
            <span className="block">{DIFFICULTY_LABELS[d]}</span>
            <span className="block text-[11px] font-normal opacity-70">
              {DIFFICULTY_THRESHOLDS[d]}m
            </span>
          </button>
        );
      })}
    </div>
  );
}
