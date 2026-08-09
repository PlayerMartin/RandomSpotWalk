import type { Achievement, Walk } from "../types";

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: "first-walk",
    title: "First Steps",
    description: "Complete your first walk",
    unlockedAt: null,
  },
  {
    id: "walk-5",
    title: "Getting Around",
    description: "Complete 5 walks",
    unlockedAt: null,
  },
  {
    id: "walk-10",
    title: "Explorer",
    description: "Complete 10 walks",
    unlockedAt: null,
  },
  {
    id: "walk-25",
    title: "Marathoner",
    description: "Complete 25 walks",
    unlockedAt: null,
  },
  {
    id: "hard-walk",
    title: "Precision Walker",
    description: "Complete a walk on Hard difficulty (10m)",
    unlockedAt: null,
  },
  {
    id: "far-walk",
    title: "Long Haul",
    description: "Complete a walk with a 10km+ radius",
    unlockedAt: null,
  },
  {
    id: "streak-3",
    title: "Consistent",
    description: "Reach a 3-day streak",
    unlockedAt: null,
  },
  {
    id: "streak-7",
    title: "Dedicated",
    description: "Reach a 7-day streak",
    unlockedAt: null,
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a walk with under 5 min on the timer",
    unlockedAt: null,
  },
];

/**
 * Evaluates achievement conditions against the given walk/totals and returns
 * the list of achievements that are now shared (but weren't unlocked before).
 * `current` is the user's currently unlocked achievements.
 */
export function checkNewAchievements(
  current: Achievement[],
  totalWalks: number,
  walk: Walk,
  streak: number,
): Achievement[] {
  const unlockedIds = new Set(
    current.filter((a) => a.unlockedAt).map((a) => a.id),
  );

  const conditions: Record<string, boolean> = {
    "first-walk": totalWalks === 1,
    "walk-5": totalWalks >= 5,
    "walk-10": totalWalks >= 10,
    "walk-25": totalWalks >= 25,
    "hard-walk": walk.difficulty === "hard",
    "far-walk": walk.radiusKm >= 10,
    "streak-3": streak >= 3,
    "streak-7": streak >= 7,
    "speed-demon":
      walk.timerSetSeconds !== null &&
      walk.timerSetSeconds - walk.elapsedSeconds < 300,
  };

  const now = new Date().toISOString();
  return ACHIEVEMENT_DEFINITIONS.filter((def) => {
    if (unlockedIds.has(def.id)) return false;
    return conditions[def.id] === true;
  }).map((def) => ({ ...def, unlockedAt: now }));
}
