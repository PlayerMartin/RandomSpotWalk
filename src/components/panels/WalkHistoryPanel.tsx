import { useState } from "react";
import { useHistoryStore } from "../../stores/historyStore";
import { useUiStore } from "../../stores/uiStore";
import { DIFFICULTY_LABELS } from "../../types";
import type { Walk } from "../../types";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WalkRow({ walk }: { walk: Walk }) {
  const cancelled = walk.status === "cancelled";
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
        cancelled
          ? "border-gray-200 bg-gray-50"
          : "border-green-200 bg-green-50/50"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {cancelled ? "Cancelled" : "Completed"}
          </span>
          <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-500">
            {DIFFICULTY_LABELS[walk.difficulty]}
          </span>
          {walk.radiusKm >= 10 && (
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
              {walk.radiusKm} km
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          {walk.destinationPoint.lat.toFixed(4)},{" "}
          {walk.destinationPoint.lng.toFixed(4)}
        </p>
      </div>
      <div className="ml-3 text-right">
        <p className="text-sm font-bold tabular-nums text-gray-700">
          {formatTime(walk.elapsedSeconds)}
        </p>
        <p className="text-[11px] text-gray-400">
          {formatDate(walk.completedAt)}
        </p>
      </div>
    </div>
  );
}

export function WalkHistoryPanel() {
  const walks = useHistoryStore((s) => s.walks);
  const clear = useHistoryStore((s) => s.clear);
  const closePanel = useUiStore((s) => s.closePanel);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="absolute inset-x-0 bottom-0 z-[800] flex justify-center">
      <div className="slide-up flex max-h-[75vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">Walk History</h2>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {walks.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No walks yet. Get out there! 🚶
            </p>
          ) : (
            walks.map((w) => <WalkRow key={w.id} walk={w} />)
          )}
        </div>

        {walks.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            {confirming ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    setConfirming(false);
                  }}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white active:bg-red-700"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 active:bg-gray-100"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 active:bg-red-50"
              >
                Clear History
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
