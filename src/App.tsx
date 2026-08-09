import { useEffect, type ReactNode } from "react";
import { useAppStore } from "./stores/appStore";
import { useHistoryStore } from "./stores/historyStore";
import { useGamificationStore } from "./stores/gamificationStore";
import { useSettingsStore } from "./stores/settingsStore";
import { useUiStore } from "./stores/uiStore";
import {
  MapView,
  SetupOverlays,
  WalkingOverlays,
  CompletedOverlays,
} from "./components/MapView";
import { SetupScreen } from "./components/screens/SetupScreen";
import { WalkingScreen } from "./components/screens/WalkingScreen";
import { CompletionScreen } from "./components/screens/CompletionScreen";
import { MapThemeToggle } from "./components/MapThemeToggle";
import { WalkHistoryPanel } from "./components/panels/WalkHistoryPanel";
import { GamificationPanel } from "./components/panels/GamificationPanel";
import { IconTrophy, IconHistory, IconBug } from "./components/ui/icons";

/* Diamond trail-blaze mark + a "spot" */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inset-0 rotate-45 rounded-[3px] border-2 border-pine" />
        <span className="h-1.5 w-1.5 rounded-full bg-blaze" />
      </span>
      <span className="font-display text-base font-extrabold leading-none tracking-tight text-pine">
        Spot Walk
      </span>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-bone/90 text-ink-muted backdrop-blur transition active:bg-sand active:text-pine"
      style={{
        boxShadow:
          "0 1px 0 rgba(30,40,38,0.06), 0 8px 20px rgba(30,40,38,0.10)",
      }}
    >
      {children}
    </button>
  );
}

/* External link that opens in a new tab, styled like an icon button. */
function IconLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-bone/90 text-ink-muted backdrop-blur transition active:bg-sand active:text-pine"
      style={{
        boxShadow:
          "0 1px 0 rgba(30,40,38,0.06), 0 8px 20px rgba(30,40,38,0.10)",
      }}
    >
      {children}
    </a>
  );
}

export default function App() {
  const phase = useAppStore((s) => s.phase);
  const startPoint = useAppStore((s) => s.startPoint);
  const destPoint = useAppStore((s) => s.destPoint);
  const radiusKm = useAppStore((s) => s.radiusKm);
  const difficulty = useAppStore((s) => s.difficulty);
  const setStartPoint = useAppStore((s) => s.setStartPoint);

  const panel = useUiStore((s) => s.panel);
  const openPanel = useUiStore((s) => s.openPanel);
  const mapTheme = useSettingsStore((s) => s.mapTheme);

  // Hydrate persisted stores on mount
  useEffect(() => {
    useHistoryStore.getState().load();
    useGamificationStore.getState().load();
    useSettingsStore.getState().load();
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden bg-bone ${
        mapTheme === "dark" ? "theme-dark" : ""
      }`}
      style={{ position: "fixed", inset: 0, height: "100dvh" }}
    >
      <MapView
        onMapClick={(point) => {
          if (phase === "setup") setStartPoint(point);
        }}
      >
        {phase === "setup" && (
          <SetupOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            radiusKm={radiusKm}
            difficulty={difficulty}
          />
        )}
        {phase === "walking" && (
          <WalkingOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            difficulty={difficulty}
            showRadius={true}
          />
        )}
        {phase === "completed" && (
          <CompletedOverlays
            startPoint={startPoint}
            destPoint={destPoint}
            difficulty={difficulty}
          />
        )}
      </MapView>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between px-3 pt-3">
        <div className="pointer-events-none flex items-center rounded-full bg-bone/90 px-4 py-2.5 backdrop-blur">
          <Logo />
        </div>
        <div className="flex gap-2">
          <IconLink
            label="Report an issue"
            href="https://github.com/PlayerMartin/RandomSpotWalk/issues"
          >
            <IconBug size={20} />
          </IconLink>
          <IconButton
            label="Achievements"
            onClick={() => openPanel("gamification")}
          >
            <IconTrophy size={20} />
          </IconButton>
          <IconButton label="History" onClick={() => openPanel("history")}>
            <IconHistory size={20} />
          </IconButton>
        </div>
      </header>

      {/* Screens */}
      {phase === "setup" && <SetupScreen />}
      {phase === "walking" && <WalkingScreen />}
      {phase === "completed" && <CompletionScreen />}

      <MapThemeToggle />

      {/* Panels */}
      {panel === "history" && <WalkHistoryPanel />}
      {panel === "gamification" && <GamificationPanel />}
    </div>
  );
}
