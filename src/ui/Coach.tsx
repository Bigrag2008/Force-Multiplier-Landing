"use client";
import { lessonsDue } from "../game/coach";
import type { Session } from "../game/session";
import { DealAnatomy, StatKey } from "./DealAnatomy";

type Run = (fn: (s: Session) => void) => void;

/** The Coach is a helper: if its advice ever fails, it goes quiet instead of taking the game down. */
export function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch (e) {
    console.error("The Coach stepped out:", e);
    return null;
  }
}

/** ring and badge for the button the Coach recommends */
export const coachRing = "ring-2 ring-[#7CFFB2] ring-offset-2 ring-offset-night shadow-[0_0_18px_rgba(124,255,178,0.55)]";
export function CoachBadge() {
  return <span className="mt-1 inline-block rounded-full bg-night px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#7CFFB2]">★ Coach&apos;s pick</span>;
}
export const picked = (on: boolean) => (on ? ` ${coachRing}` : "");

/** The Coach's corner: the next rule worth learning right now, then what it would do and why. */
export function CoachBox({ s, run, view = "board", sight = 0, advice }: { s: Session; run: Run; view?: "board" | "deal"; sight?: number; advice?: { title: string; why: string } | null }) {
  if (!s.coach) return null;
  const lesson = safe(() => lessonsDue(s, view, sight).find((l) => !s.seenLessons.has(l.id)));
  if (!lesson && !advice) return null;
  return (
    <aside aria-label="The Coach" aria-live="polite" className="space-y-2 rounded-lg border border-[#7CFFB2]/50 bg-[#7CFFB2]/10 p-3 text-sm">
      {lesson && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#7CFFB2]">Coach · new rule</p>
          <p className="font-black">{lesson.title}</p>
          <p className="mt-1 text-program/90">{lesson.body}</p>
          {lesson.id === "turn" && <StatKey />}
          {(lesson.id === "glasses" || lesson.id === "blind") && <DealAnatomy />}
          <button className="mt-2 rounded-md bg-[#7CFFB2] px-3 py-1 text-xs font-black text-night" onClick={() => run((x) => x.seenLessons.add(lesson.id))}>
            Got it
          </button>
        </div>
      )}
      {advice && (
        <div className={lesson ? "border-t border-[#7CFFB2]/30 pt-2" : ""}>
          <p className="text-[11px] font-black uppercase tracking-widest text-[#7CFFB2]">Coach says</p>
          <p className="font-black">{advice.title}</p>
          <p className="mt-0.5 text-program/90">{advice.why}</p>
        </div>
      )}
    </aside>
  );
}
