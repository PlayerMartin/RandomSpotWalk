export function RadiusInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (km: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">Radius</span>
      <div className="relative flex-1">
        <input
          type="number"
          min={0}
          step="0.1"
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="w-full rounded-xl border-2 border-gray-200 bg-white py-2 pl-3 pr-10 text-base font-semibold text-gray-800 outline-none focus:border-blue-500"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">km</span>
      </div>
    </label>
  );
}
