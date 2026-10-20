"use client";
import { useEffect, type RefObject } from "react";
import type { Impact, Tone } from "./readImpact";
import { sounds } from "./sound";

const TONE: Record<Tone, { ink: string; bg: string; flash: string }> = {
  good: { ink: "#1f8a4c", bg: "#eafbef", flash: "rgba(63,163,77,0.28)" },
  bad: { ink: "#c1121f", bg: "#fff0f0", flash: "rgba(230,57,70,0.38)" },
  shady: { ink: "#7b3fd1", bg: "#f5eeff", flash: "rgba(123,63,209,0.38)" },
  calm: { ink: "#3d4a5c", bg: "#f2f2ee", flash: "rgba(0,0,0,0)" },
  gold: { ink: "#a86b00", bg: "#fff8e6", flash: "rgba(242,182,50,0.32)" },
  dark: { ink: "#F2B632", bg: "#120d24", flash: "rgba(8,4,20,0.6)" },
};
/** seconds between the Machine's strikes, so they land one at a time */
export const STRIKE_GAP = 0.38;
const STAMP_S = 1.5;
const BANNER_S = 2.2;

/**
 * One move can do a lot: a verdict on your deal, then (if it ended the round) the Machine's strikes,
 * then the big moments. They play in that order instead of on top of each other.
 */
export function timeline(impact: Impact | null) {
  const strikeStart = impact?.verdict ? STAMP_S : 0;
  const struck = impact ? impact.strikes.length + impact.muddied.length : 0;
  const bannerStart = strikeStart + (struck ? Math.min(struck, 6) * STRIKE_GAP + 0.5 : 0);
  return { strikeStart, bannerStart };
}

/** The verdict on your decision, and a banner for each big moment, over the board. */
export function ImpactLayer({ impact, id }: { impact: Impact | null; id: number }) {
  if (!impact || (!impact.verdict && !impact.moments.length)) return null;
  const v = impact.verdict;
  const first = v ?? impact.moments[0];
  const start = timeline(impact).bannerStart;
  return (
    <div key={id} aria-hidden className="pointer-events-none fixed inset-0 z-40">
      {TONE[first.tone].flash !== "rgba(0,0,0,0)" && (
        <div className="flash absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 35%, ${TONE[first.tone].flash} 100%)` }} />
      )}
      {v && (
        <div
          className="stamp-in absolute left-1/2 top-[18%] w-[min(88vw,420px)] rounded-xl border-[5px] px-5 py-3 text-center shadow-2xl"
          style={{ borderColor: TONE[v.tone].ink, color: TONE[v.tone].ink, background: TONE[v.tone].bg }}
        >
          <p className="text-3xl font-black tracking-wider sm:text-4xl">{v.title}</p>
          <p className="mt-1 text-sm font-bold opacity-90">{v.sub}</p>
        </div>
      )}
      {impact.moments.map((m, i) => (
        <div
          key={i}
          className="banner absolute left-1/2 top-[30%] w-[min(92vw,520px)] rounded-2xl border-2 px-5 py-4 text-center shadow-2xl"
          style={{
            animationDelay: `${start + i * BANNER_S}s`,
            borderColor: TONE[m.tone].ink,
            background: m.tone === "dark" ? TONE.dark.bg : "rgba(18,13,36,0.94)",
            color: m.tone === "dark" ? TONE.dark.ink : "#fff",
          }}
        >
          <p className="text-2xl font-black" style={{ color: m.tone === "dark" ? TONE.dark.ink : TONE[m.tone].ink === "#3d4a5c" ? "#fff" : lighten(m.tone) }}>
            {icon(m.kind)} {m.title}
          </p>
          <p className="mt-1 text-sm text-white/85">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}

const lighten = (t: Tone) => ({ good: "#7CFFB2", bad: "#ff8a8a", shady: "#c9a2ff", calm: "#fff", gold: "#F2B632", dark: "#F2B632" })[t];
const icon = (k: string) =>
  ({ fallen: "⚠", reached: "🤝🏾", captured: "✖", awake: "💡", underworld: "⚑", pattern: "⚠", broken: "✦", greenbook: "📗", league: "✦", sitout: "⏸", won: "✦", lost: "⏳", forged: "🃏" })[k] ?? "";

/** The screen jolts for the worst moments, and a phone buzzes. Never remounts the board. */
export function useJolt(ref: RefObject<HTMLElement | null>, impact: Impact | null, id: number) {
  useEffect(() => {
    if (!impact?.shake || !ref.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    ref.current.animate(
      [{ transform: "translate(0,0)" }, { transform: "translate(-6px,2px)" }, { transform: "translate(5px,-2px)" }, { transform: "translate(-3px,1px)" }, { transform: "translate(0,0)" }],
      { duration: 380, easing: "ease-out" },
    );
    try {
      navigator.vibrate?.(impact.moments.some((m) => m.kind === "captured") ? [60, 40, 90] : 70);
    } catch {
      // no vibration here: the jolt is enough
    }
  }, [impact, id, ref]);
}

/** The sound of a move, in the same order the screen plays it: the verdict, the strikes, the banners. */
export function useImpactSound(impact: Impact | null, id: number) {
  useEffect(() => {
    if (!impact) return;
    const v = impact.verdict;
    if (v) {
      if (v.kind === "walked") sounds.paper();
      else {
        sounds.stamp();
        const follow = { defused: sounds.good, exposed: sounds.good, close: sounds.good, honest: sounds.help, shortcut: sounds.shady }[v.kind as string] ?? sounds.bad;
        follow(0.12);
      }
    }
    const { strikeStart, bannerStart } = timeline(impact);
    impact.strikes.forEach((_, i) => sounds.strike(strikeStart + i * STRIKE_GAP));
    impact.moments.forEach((m, i) => {
      const at = bannerStart + i * BANNER_S;
      if (m.kind === "awake") sounds.wake(at);
      else if (m.kind === "won") sounds.win(at);
      else if (m.kind === "forged" || m.kind === "sitout") sounds.shady(at);
      else if (["captured", "fallen", "lost", "pattern"].includes(m.kind)) sounds.loss(at);
      else sounds.good(at);
    });
  }, [impact, id]);
}

/** What a move did, as one plain sentence for screen readers (the overlay is visual only). */
export function spokenImpact(impact: Impact | null): string {
  if (!impact) return "";
  const parts: string[] = [];
  if (impact.verdict) parts.push(`${impact.verdict.title}. ${impact.verdict.sub}`);
  const T = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();
  if (impact.strikes.length) parts.push(`The Machine struck ${impact.strikes.map(T).join(", ")}.`);
  for (const m of impact.moments) parts.push(`${m.title}. ${m.sub}`);
  return parts.join(" ");
}
