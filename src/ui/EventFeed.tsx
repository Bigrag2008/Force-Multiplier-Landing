"use client";
import { useEffect, useRef } from "react";
import type { Session } from "../game/session";

function tone(line: string) {
  if (/✖|⚠|got played|FALLEN|clock ran out|buries|feeds|whispers|peels|collections|creeps|covers|scare/.test(line)) return "text-[#ff9b9b]";
  if (/⚑|UNDERWORLD|COOKOUT/.test(line)) return "text-gold";
  if (/✦|defused|HONEST|pulls them home|⛨|traces|AWAKE|Green Book|paid off|Call and response|LEAGUE FORMS/.test(line)) return "text-[#8be0b5]";
  return "text-program/90";
}

export function EventFeed({ s, version }: { s: Session; version: number }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), [version]);
  const lines = s.g.log.slice(-60);
  const offset = s.g.log.length - lines.length;
  return (
    <section aria-label="What happened" aria-live="polite" className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-[12px] leading-relaxed">
      {lines.length === 0 && <p className="text-program/60">The story of the game appears here.</p>}
      {lines.map((l, i) => (
        <p key={offset + i} className={`${tone(l)} ${offset + i >= s.stepStart ? "" : "opacity-70"} ${l.startsWith("  ") ? "pl-4" : ""}`}>
          {l.trim()}
        </p>
      ))}
      <div ref={end} />
    </section>
  );
}
