import { useState } from "react";
import { useAppStore } from "../../stores/appStore";
import { useGpsStore } from "../../stores/gpsStore";
import { RadiusInput } from "../ui/RadiusInput";
import { DifficultySelector } from "../ui/DifficultySelector";
import { TimerToggle } from "../ui/TimerToggle";
import { ActionButtons } from "../ui/ActionButtons";
import { IconPin, IconClose, IconTarget } from "../ui/icons";

export function SetupScreen() {
  const startPoint = useAppStore((s) => s.startPoint);
  const destPoint = useAppStore((s) => s.destPoint);
  const radiusKm = useAppStore((s) => s.radiusKm);
  const difficulty = useAppStore((s) => s.difficulty);
  const timerSeconds = useAppStore((s) => s.timerSeconds);
  const setStartPoint = useAppStore((s) => s.setStartPoint);
  const clearStartPoint = useAppStore((s) => s.clearStartPoint);
  const setRadius = useAppStore((s) => s.setRadius);
  const setDifficulty = useAppStore((s) => s.setDifficulty);
  const setTimer = useAppStore((s) => s.setTimer);
  const generateDest = useAppStore((s) => s.generateDest);
  const rerollDest = useAppStore((s) => s.rerollDest);
  const startWalk = useAppStore((s) => s.startWalk);

  const gps = useGpsStore((s) => s.position);
  const gpsError = useGpsStore((s) => s.error);
  const requestCurrentPosition = useGpsStore((s) => s.requestCurrentPosition);
  const setGpsError = useGpsStore((s) => s.setError);
  const [locating, setLocating] = useState(false);

  // If a fix is known, place it directly and skip the prompt; otherwise run a
  // fresh one-shot request that fires the permission prompt + shows "Locating…".
  const handleUseLocation = () => {
    if (gps) {
      setGpsError(null);
      setStartPoint(gps);
      setLocating(false);
      return;
    }
    setLocating(true);
    requestCurrentPosition(
      (pos) => {
        setStartPoint(pos);
        setLocating(false);
      },
      () => setLocating(false),
    );
  };

  const [timerEnabled, setTimerEnabled] = useState(timerSeconds !== null);
  const [timerMinutes, setTimerMinutes] = useState(
    timerSeconds !== null ? Math.max(1, Math.round(timerSeconds / 60)) : 15,
  );

  // Radius is typed as text so it can be cleared while editing; validated on
  // submit but synced to the store on every valid keystroke.
  const [radiusDraft, setRadiusDraft] = useState<string>(() =>
    String(radiusKm),
  );
  const [radiusError, setRadiusError] = useState<string | null>(null);

  const handleRadiusText = (text: string) => {
    setRadiusDraft(text);
    const v = parseFloat(text);
    if (Number.isFinite(v)) setRadius(v);
    if (text.trim() !== "") setRadiusError(null);
  };

  const validateRadius = (): boolean => {
    const v = parseFloat(radiusDraft);
    if (radiusDraft.trim() === "" || !Number.isFinite(v) || v <= 0) {
      setRadiusError("Select a valid radius in km");
      return false;
    }
    setRadiusError(null);
    return true;
  };

  const handleGenerate = () => {
    if (!validateRadius()) return;
    generateDest();
  };
  const handleStart = () => {
    if (!validateRadius()) return;
    startWalk();
  };

  // Enter in the radius field: validate only — do NOT generate a spot or start
  // the walk. Return validity so the input can blur (close the keyboard) on success.
  const handleRadiusEnter = (): boolean => validateRadius();

  const handleToggleTimer = (enabled: boolean) => {
    setTimerEnabled(enabled);
    setTimer(enabled ? timerMinutes * 60 : null);
  };
  const handleTimerChange = (minutes: number) => {
    setTimerMinutes(minutes);
    if (timerEnabled) setTimer(minutes * 60);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] flex flex-col items-stretch gap-3 px-3 pb-4">
      {/* Start point prompt / use-my-location */}
      {!startPoint && (
        <div className="pointer-events-auto flex flex-col items-center gap-2 self-center">
          <button
            type="button"
            onClick={handleUseLocation}
            className="flex items-center gap-2 rounded-full bg-pine px-4 py-2.5 text-sm font-semibold text-white shadow-md active:bg-pine-deep"
          >
            <IconPin size={16} />
            Use my location
          </button>
          <div className="flex items-center gap-2 rounded-full bg-bone/95 px-4 py-2 text-xs font-semibold text-ink shadow-md backdrop-blur">
            <IconTarget size={14} className="text-blaze" />
            or tap the map to set your start point
          </div>
          {/* Progress & location feedback — the button never silently does nothing */}
          {(locating || gpsError) && (
            <div
              className={`flex max-w-xs items-center gap-2 rounded-xl px-4 py-2.5 text-center text-xs font-semibold leading-relaxed shadow-md ${
                locating
                  ? "bg-warn-bg text-warn-text"
                  : "bg-danger-bg text-danger-text"
              }`}
              role="status"
            >
              {locating ? (
                <>
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-warn-dot" />
                  Locating your position…
                </>
              ) : (
                gpsError
              )}
            </div>
          )}
        </div>
      )}

      {/* Control card */}
      {startPoint && (
        <div className="pointer-events-auto rounded-3xl bg-bone/97 p-4 shadow-2xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-pine" />
              Start point set
            </span>
            <button
              type="button"
              onClick={clearStartPoint}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-ink-muted active:bg-sand active:text-danger-text"
            >
              <IconClose size={14} />
              Clear
            </button>
          </div>
          <div className="space-y-4">
            <RadiusInput
              value={radiusDraft}
              onChange={handleRadiusText}
              error={radiusError}
              onEnter={handleRadiusEnter}
            />
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <TimerToggle
              enabled={timerEnabled}
              minutes={timerMinutes}
              onToggle={handleToggleTimer}
              onChange={handleTimerChange}
            />
          </div>
          <div className="mt-4">
            <ActionButtons
              hasDest={!!destPoint}
              canStart={!!startPoint}
              onGenerate={handleGenerate}
              onReroll={rerollDest}
              onStart={handleStart}
            />
          </div>
        </div>
      )}
    </div>
  );
}
