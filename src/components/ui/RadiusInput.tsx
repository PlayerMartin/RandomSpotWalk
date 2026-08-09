export function RadiusInput({
  value,
  onChange,
  error,
  onEnter,
}: {
  value: string;
  onChange: (text: string) => void;
  error?: string | null;
  onEnter?: () => void;
}) {
  const invalid = !!error;
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        How far can the spot be?
      </span>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => {
            // Digits plus a single decimal point; a trailing/blank value is
            // allowed while typing (validation happens on submit instead).
            let cleaned = e.target.value.replace(/[^0-9.]/g, "");
            const firstDot = cleaned.indexOf(".");
            if (firstDot !== -1) {
              cleaned =
                cleaned.slice(0, firstDot + 1) +
                cleaned.slice(firstDot + 1).replace(/\./g, "");
            }
            onChange(cleaned);
          }}
          onKeyDown={(e) => {
            // Enter confirms the radius: validate it, then close the keyboard
            // (blur) only when the value is valid.
            if (e.key === "Enter") {
              e.preventDefault();
              const valid = onEnter?.() ?? true;
              if (valid) e.currentTarget.blur();
            }
          }}
          aria-invalid={invalid || undefined}
          className={`w-full rounded-xl border bg-bone py-2.5 pl-3.5 pr-12 text-lg font-bold text-ink outline-none transition ${
            invalid
              ? "border-danger-border focus:border-danger-border"
              : "border-line focus:border-pine"
          }`}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-muted">
          km
        </span>
      </div>
      {invalid && (
        <span className="mt-1.5 block text-xs font-semibold text-danger-text">
          {error}
        </span>
      )}
    </label>
  );
}
