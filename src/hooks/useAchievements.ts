import { useAppStore } from '../stores/appStore';
import type { Achievement } from '../types';

export function useAchievements(): {
  newlyUnlocked: Achievement[];
  clearNewlyUnlocked: () => void;
} {
  const newlyUnlocked = useAppStore((s) => s.newlyUnlocked);
  const clear = () =>
    useAppStore.setState(() => ({ newlyUnlocked: [] }));

  return { newlyUnlocked, clearNewlyUnlocked: clear };
}
