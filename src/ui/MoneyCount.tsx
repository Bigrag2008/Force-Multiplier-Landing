"use client";
import { useEffect, useState } from "react";
import type { Session } from "../game/session";
import { sounds } from "./sound";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** a dollar figure that counts up from zero, the way a bill adds up */
function CountUp({ to, ms = 1400 }: { to: number; ms?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setN(to); // eslint-disable-line react-hooks/set-state-in-effect
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return <>{usd(n)}</>;
}

/**
 * The real money behind the game: every deal has a second number, so the end of the game adds them up.
 * "This game, the block signed $14,300 of traps and walked away from $2,100 of real help."
 */
export function MoneyCount({ s }: { s: Session }) {
  const g = s.g;
  // the register rings as the count adds up
  useEffect(() => {
    if (s.g.signed.length) sounds.register(0.9);
  }, [s]);
  const m = g.money();
  const ck = s.clock;
  if (!g.signed.length) return null;
  // era cards count in their own era's dollars; the rest of the deck in today's
  const era = g.chapter?.era_dollars ? ` (era cards in ${g.chapter.era_dollars})` : "";
  const kept = m.defused + m.dodged;
  return (
    <div className="mt-5 rounded-xl border border-white/20 bg-black/30 p-4" aria-label="The second number, this game">
      <h3 className="text-xs font-black uppercase tracking-widest text-gold">The second number, this game{era}</h3>
      <p className="mt-2 text-lg leading-snug">
        The block signed <b className="text-2xl text-[#ff8a8a]"><CountUp to={m.taken} /></b> of traps
        {m.refused > 0 ? (
          <>
            {" "}and walked away from <b className="text-2xl text-[#ffb35c]"><CountUp to={m.refused} /></b> of real help.
          </>
        ) : (
          "."
        )}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <Stat label="Stayed out of" value={kept} tone="#7CFFB2" sub={`${usd(m.defused)} read and defused · ${usd(m.dodged)} walked away from`} />
        <Stat label="Real help taken" value={m.help} tone="#F2B632" />
        <Stat label="Shortcuts signed" value={m.taken} tone="#ff8a8a" sub={`${m.shortcuts} shortcut${m.shortcuts === 1 ? "" : "s"}`} />
        <Stat label="Got played on" value={m.played} tone="#ff8a8a" />
      </dl>
      {m.worst && (
        <p className="mt-3 rounded-lg border border-[#ff8a8a]/40 bg-[#ff8a8a]/10 p-2 text-sm">
          <b>The most expensive shortcut:</b> {m.worst.who} signed <i>&ldquo;{m.worst.front}&rdquo;</i>: <b className="text-[#ff8a8a]">{usd(m.worst.dollars)}</b>
          {m.worst.basis && <span className="text-program/75">, {m.worst.basis}</span>}.
        </p>
      )}
      {ck.rushed + ck.waited > 0 && (
        <p className="mt-2 text-sm">
          ⏱ <b>{ck.rushed}</b> decision{ck.rushed === 1 ? "" : "s"} made with a fake clock running
          {ck.rushedDollars > 0 && <> (<b className="text-[#ff8a8a]">{usd(ck.rushedDollars)}</b> of traps signed in the rush)</>}
          {ck.waited > 0 && <>; <b className="text-[#7CFFB2]">{ck.waited}</b> fake deadline{ck.waited === 1 ? "" : "s"} waited out, at no cost</>}.
        </p>
      )}
      {m.playedMost && (
        <p className="mt-2 text-sm">
          <b>{m.playedMost.who}</b> got played {m.playedMost.times === 1 ? "once" : `${m.playedMost.times} times`}: negotiating without the Read to back it.
        </p>
      )}
      <p className="mt-3 rounded-lg bg-gold/10 p-2 text-sm">
        Got a real deal at home: a phone plan, a car loan, a receipt?{" "}
        <a href="/my-deal" className="font-black text-gold underline">Read its second number</a>. Nothing leaves your device.
      </p>
      <p className="mt-3 text-xs text-program/60">
        Typical real-world amounts for one household over about a year, not quotes. Every card&apos;s figure and its basis are in the rulebook&apos;s answer key.
      </p>
    </div>
  );
}

function Stat({ label, value, tone, sub }: { label: string; value: number; tone: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-white/5 p-2">
      <dt className="text-[11px] text-program/70">{label}</dt>
      <dd className="break-words text-lg font-black leading-tight" style={{ color: tone }}>
        <CountUp to={value} />
      </dd>
      {sub && <dd className="text-[10px] text-program/60">{sub}</dd>}
    </div>
  );
}
