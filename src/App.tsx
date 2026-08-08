import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import { useHistoryStore } from './stores/historyStore';
import { useGamificationStore } from './stores/gamificationStore';
import { useSettingsStore } from './stores/settingsStore';
import { useUiStore } from './stores/uiStore';
import { MapView, SetupOverlays, WalkingOverlays, CompletedOverlays } from './components/MapView';
import { SetupScreen } from './components/screens/SetupScreen';
import { WalkingScreen } from './components/screens/WalkingScreen';
import { CompletionScreen } from './components/screens/CompletionScreen';
import { MapThemeToggle } from './components/MapThemeToggle';
import { WalkHistoryPanel } from './components/panels/WalkHistoryPanel';
import { GamificationPanel } from './components/panels/GamificationPanel';

export default function App() {
  const phase = useAppStore((s) => s.phase);
  const startPoint = useAppStore((s) => s.startPoint);
  const destPoint = useAppStore((s) => s.destPoint);
  const radiusKm = useAppStore((s) => s.radiusKm);
  const difficulty = useAppStore((s) => s.difficulty);
  const setStartPoint = useAppStore((s) => s.setStartPoint);

  const panel = useUiStore((s) => s.panel);
  const openPanel = useUiStore((s) => s.openPanel);

  // Hydrate persisted stores on mount
  useEffect(() => {
    useHistoryStore.getState().load();
    useGamificationStore.getState().load();
    useSettingsStore.getState().load();
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-100"
      style={{ position: 'fixed', inset: 0, height: '100dvh' }}
    >
      <MapView
        onMapClick={(point) => {
          if (phase === 'setup') setStartPoint(point);
        }}
      >
        {phase === 'setup' && (
          <SetupOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            radiusKm={radiusKm}
            difficulty={difficulty}
          />
        )}
        {phase === 'walking' && (
          <WalkingOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            difficulty={difficulty}
            showRadius={true}
          />
        )}
        {phase === 'completed' && (
          <CompletedOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            difficulty={difficulty}
          />
        )}
      </MapView>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between px-3 pt-3">
        <div className="rounded-full bg-white/95 px-4 py-2 text-base font-black tracking-tight text-gray-900 shadow-lg backdrop-blur">
          🎯 Random Spot Walk
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openPanel('gamification')}
            aria-label="Achievements"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-lg active:bg-gray-100"
          >
            🏆
          </button>
          <button
            type="button"
            onClick={() => openPanel('history')}
            aria-label="History"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-lg active:bg-gray-100"
          >
            📜
          </button>
        </div>
      </header>

      {/* Screens */}
      {phase === 'setup' && <SetupScreen />}
      {phase === 'walking' && <WalkingScreen />}
      {phase === 'completed' && <CompletionScreen />}

      <MapThemeToggle />

      {/* Panels */}
      {panel === 'history' && <WalkHistoryPanel />}
      {panel === 'gamification' && <GamificationPanel />}
    </div>
  );
}
