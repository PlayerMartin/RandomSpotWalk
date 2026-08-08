import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useGpsStore } from '../../stores/gpsStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import { RadiusInput } from '../ui/RadiusInput';
import { DifficultySelector } from '../ui/DifficultySelector';
import { TimerToggle } from '../ui/TimerToggle';
import { ActionButtons } from '../ui/ActionButtons';

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

  // Try to get a live location while on the setup screen
  useGeolocation(true);

  const [timerEnabled, setTimerEnabled] = useState(timerSeconds !== null);
  const [timerMinutes, setTimerMinutes] = useState(
    timerSeconds !== null ? Math.max(1, Math.round(timerSeconds / 60)) : 15,
  );

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
      <div className="pointer-events-auto self-center">
        {!startPoint && gps ? (
          <button
            type="button"
            onClick={() => setStartPoint(gps)}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg active:bg-blue-700"
          >
            📍 Use my location
          </button>
        ) : !startPoint ? (
          <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-700 shadow-lg">
            Tap the map to set your start point
          </div>
        ) : null}
      </div>

      {/* GPS error banner */}
      {gpsError && !startPoint && (
        <div className="pointer-events-auto mx-auto max-w-xs self-center rounded-xl bg-red-500/95 px-4 py-2 text-center text-xs font-semibold leading-relaxed text-white shadow-lg">
          ⚠️ {gpsError}
        </div>
      )}

      {/* Control card */}
      {startPoint && (
        <div className="pointer-events-auto rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Start point set</span>
            <button
              type="button"
              onClick={clearStartPoint}
              className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 active:bg-red-50"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="mb-4 space-y-3">
            <RadiusInput value={radiusKm} onChange={setRadius} />
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
            <TimerToggle
              enabled={timerEnabled}
              minutes={timerMinutes}
              onToggle={handleToggleTimer}
              onChange={handleTimerChange}
            />
          </div>
          <ActionButtons
            hasDest={!!destPoint}
            canStart={!!startPoint}
            onGenerate={generateDest}
            onReroll={rerollDest}
            onStart={startWalk}
          />
        </div>
      )}
    </div>
  );
}
