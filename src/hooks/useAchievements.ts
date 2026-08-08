import { useAppStore } from '../stores/appStore';
import type { Achievement } from '../types';

/**
 * Thin wrapper around appStore's `newlyUnlocked` list (set on walk
 * completion) with a way to clear it after toasts are dismissed.
 */
export function useAchievements(): {
  newlyUnlocked: Achievement[];
  clearNewlyUnlocked: () => void;
} {
  const newlyUnlocked = useAppStore((s) => s.newlyUnlocked);
  const clear = () =>
    useAppStore.setState(() => ({ newlyUnlocked: [] }));

  return { newlyUnlocked, clearNewlyUnlocked: clear };
}
