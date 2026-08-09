import { useSettingsStore } from "../stores/settingsStore";
import { IconMoon, IconSun } from "./ui/icons";

export function MapThemeToggle() {
  const mapTheme = useSettingsStore((s) => s.mapTheme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle map theme"
      className="absolute right-3 top-16 z-[900] flex h-11 w-11 items-center justify-center rounded-full bg-bone/90 text-ink-muted backdrop-blur transition active:bg-sand active:text-pine"
      style={{
        boxShadow:
          "0 1px 0 rgba(30,40,38,0.06), 0 8px 20px rgba(30,40,38,0.10)",
      }}
    >
      {mapTheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
    </button>
  );
}
