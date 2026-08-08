export function RadiusInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (km: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        How far can the spot be?
      </span>
      <div className="relative">
        <input
          type="number"
          min={0}
          step="0.1"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="w-full rounded-xl border border-line bg-bone py-2.5 pl-3.5 pr-12 text-lg font-bold text-ink outline-none transition focus:border-pine"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-muted">
          km
        </span>
      </div>
    </label>
  );
}
