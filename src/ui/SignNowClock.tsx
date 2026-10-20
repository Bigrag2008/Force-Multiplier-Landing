"use client";
import { useEffect, useState } from "react";
import type { ClockTag } from "../game/moves";

/** how long a "sign now" pitch gives you, in seconds */
export const RUSH_SECONDS = 15;

export type ClockState = "off" | "running" | "expired" | "seen";
/** what a choice made right now goes on record as */
export const clockTag = (c: ClockState): ClockTag | undefined => (c === "running" ? "rushed" : c === "expired" ? "waited" : undefined);

/**
 * A "sign now" deal counts down while you decide, the way real ones push you. The deadline is fake:
 * wait it out and the offer is still there. Read 2 (amber, the clock) shows you that from the start.
 */
export function useSignNow(rush: boolean, sight: number, on: boolean): [ClockState, number] {
  const seen = rush && on && sight >= 2;
  const [left, setLeft] = useState(RUSH_SECONDS);
  const running = rush && on && !seen && left > 0;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [running, left]);
  if (!rush || !on) return ["off", 0];
  if (seen) return ["seen", 0];
  return [left > 0 ? "running" : "expired", left];
}

export function SignNowClock({ state, left }: { state: ClockState; left: number }) {
  if (state === "off") return null;
  if (state === "seen")
    return (
      <div className="rounded-lg border-2 border-[#E0A526] bg-[#E0A526]/15 px-3 py-2 text-sm" role="status">
        <b className="text-[#E0A526]">⏱ <s>&ldquo;Offer ends today!&rdquo;</s></b> Your amber Read sees the clock: the deadline is fake. Take your time.
      </div>
    );
  if (state === "expired")
    return (
      <div className="stamp-settle rounded-lg border-2 border-[#7CFFB2] bg-[#7CFFB2]/10 px-3 py-2 text-sm" role="status">
        <b className="text-[#7CFFB2]">STILL HERE.</b> The offer didn&apos;t expire. It never does. Slowing down cost you nothing.
      </div>
    );
  const urgent = left <= 5;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border-2 px-3 py-2 ${urgent ? "urge border-[#E63946] bg-[#E63946]/25" : "border-[#E63946]/70 bg-[#E63946]/10"}`}
      role="timer"
      aria-live={urgent ? "assertive" : "off"}
    >
      <span className="text-sm font-black uppercase tracking-wide text-[#ff8a8a]">⏱ Offer expires — sign now!</span>
      <span className="font-mono text-2xl font-black tabular-nums text-white">0:{String(left).padStart(2, "0")}</span>
    </div>
  );
}
