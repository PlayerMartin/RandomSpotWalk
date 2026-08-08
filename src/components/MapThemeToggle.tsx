import { useSettingsStore } from '../stores/settingsStore';

export function MapThemeToggle() {
  const mapTheme = useSettingsStore((s) => s.mapTheme);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle map theme"
      className="absolute right-3 top-16 z-[900] flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-lg active:bg-gray-100"
    >
      {mapTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
