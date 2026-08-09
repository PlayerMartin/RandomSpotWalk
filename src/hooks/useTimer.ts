import { useEffect, useState } from "react";

interface TimerResult {
  elapsed: number;
  remaining: number | null; // null if no countdown set
  isExpired: boolean; // true when countdown reached 0
}

/**
 * Date-based elapsed + optional countdown — survives tab sleep (wall-clock).
 */
export function useTimer(
  startedAt: string | null,
  countdownSeconds: number | null,
): TimerResult {
  const [now, setNow] = useState<number>(Date.now());

  // Tick every second while a walk is in progress
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    // Update immediately when a walk starts so the timer isn't stale.
    setNow(Date.now());
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) {
    return { elapsed: 0, remaining: countdownSeconds, isExpired: false };
  }

  const base = new Date(startedAt).getTime();
  const elapsed = Math.max(0, Math.floor((now - base) / 1000));
  const remaining =
    countdownSeconds === null ? null : Math.max(0, countdownSeconds - elapsed);
  const isExpired =
    countdownSeconds !== null && remaining !== null && remaining <= 0;

  return { elapsed, remaining, isExpired };
}
