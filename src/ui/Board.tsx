"use client";
import type { ReactNode } from "react";
import { C, DISTRICTS, K, type District } from "../engine/content";
import type { Session } from "../game/session";
import { signed, type Delta } from "./changes";
import { Icon, Pips, type IconName } from "./icons";
import { DISTRICT_COLOR, titleCase } from "./theme";

export type Changes = { id: number; delta: Delta } | null;

/** a number that floats up off whatever it changed, then fades */
export function Float({ id, n, icon, className = "" }: { id: number; n: number; icon: IconName; className?: string }) {
  const good = icon === "corruption" || icon === "pressure" ? n < 0 : n > 0;
  return (
    <span
      data-change={id}
      className={`float-up pointer-events-none inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-black shadow ${good ? "bg-[#1f6b3a] text-white" : "bg-[#8b1e1e] text-white"} ${className}`}
    >
      {signed(n)} <Icon name={icon} size={11} color="white" />
    </span>
  );
}

function Track({ value, max, color, label, name, end }: { value: number; max: number; color: string; label: ReactNode; name: string; end: string }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-1 whitespace-nowrap text-[10px] font-bold uppercase">
        <span className="inline-flex items-center gap-1">{label}</span>
        <span className="text-[9px]" style={{ color }}>{end}</span>
      </div>
      <div className="mt-0.5 grid grid-cols-4 gap-1" aria-label={`${name} ${value} of ${max}`}>
        {Array.from({ length: max + 1 }, (_, i) => (
          <div
            key={i}
            className="h-6 rounded text-center text-xs font-black leading-6"
            style={{
              border: `2px solid ${color}`,
              background: i <= value && value > 0 && i > 0 ? color : "white",
              color: i <= value && value > 0 && i > 0 ? "white" : color,
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

function DistrictBlock({ s, d, highlight, changes }: { s: Session; d: District; highlight?: boolean; changes: Changes }) {
  const g = s.g;
  const c = g.clarity[d];
  const p = g.pressure[d];
  const status =
    p >= K.CAPTURE ? { t: "CAPTURED", c: "#E63946" } : c >= K.WAKE ? { t: "AWAKE", c: "#F2B632" } : p >= K.GRIP ? { t: "gripped", c: "#E63946" } : null;
  const ch = changes?.delta.districts[d];
  return (
    <div
      className={`relative rounded-xl border-2 bg-white text-ink shadow ${highlight ? "ring-4 ring-gold" : ""}`}
      style={{ borderColor: DISTRICT_COLOR[d] }}
    >
      {ch && (
        <div key={changes!.id} className="glow-out pointer-events-none absolute inset-0 z-10 rounded-xl" style={{ ["--glow" as string]: (ch.pressure ?? 0) > 0 || (ch.clarity ?? 0) < 0 ? "#E63946" : "#3FA34D" }}>
          <div className="absolute -top-2 right-1 flex flex-col items-end gap-0.5">
            {ch.clarity ? <Float key={changes!.id} id={changes!.id} n={ch.clarity} icon="clarity" /> : null}
            {ch.pressure ? <Float key={changes!.id} id={changes!.id} n={ch.pressure} icon="pressure" /> : null}
          </div>
        </div>
      )}
      <div className="rounded-t-lg px-2 py-1.5 text-center text-white" style={{ background: DISTRICT_COLOR[d] }}>
        <div className="text-sm font-black tracking-wide">{d}</div>
        <div className="text-[10px] italic opacity-90">{C.dayton[d].sub}</div>
      </div>
      <div className="space-y-2 p-2">
        <Track value={c} max={K.WAKE} color={DISTRICT_COLOR[d]} name="Clarity" label={<><Icon name="clarity" size={12} color={DISTRICT_COLOR[d]} /> Clarity</>} end="3 = awake" />
        <Track value={p} max={K.CAPTURE} color="#E63946" name="Pressure" label={<><Icon name="pressure" size={12} /> Pressure</>} end="3 = captured" />
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-black" style={{ color: status?.c }}>{status?.t ?? " "}</span>
          {g.threads.has(d) ? <span className="font-bold text-[#2F8FD8]">🔵 thread</span> : null}
          {g.struck.has(d) && s.phase !== "machine" ? <span className="text-black/40">struck</span> : null}
        </div>
      </div>
    </div>
  );
}

export function Board({ s, highlight, changes = null }: { s: Session; highlight?: District | null; changes?: Changes }) {
  const g = s.g;
  const patterns = g.activePatterns();
  return (
    <section aria-label="The West Dayton board" className="space-y-3">
      <GoalTrack s={s} changes={changes} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {DISTRICTS.map((d) => (
          <DistrictBlock key={d} s={s} d={d} highlight={highlight === d} changes={changes} />
        ))}
      </div>
      {patterns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {patterns.map((p) => (
            <span key={p.name} title={p.lesson} className="rounded-full bg-[#8b1e1e] px-3 py-1 text-xs font-bold text-white">
              ⚠ {p.name} · {p.combo.map(titleCase).join(" + ")}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-2 rounded-xl border border-gold/40 bg-black/25 p-3 text-sm sm:grid-cols-2">
        <div>
          <div className="font-black text-gold">The Owner</div>
          <p className="text-program/80">
            {g.ownerShown ? <b className="text-gold">{g.ownerFace}</b> : <span>hidden. Watch the board and deduce it.</span>}
          </p>
        </div>
        <div className="space-y-1">
          <div>
            <span className="font-bold text-gold">Sou-Sou pot</span> {g.pot}/{K.SOUSOU_HAND} · next hand: {g.nextHand()?.name ?? "—"}
          </div>
          <div>📗 Green Book: {g.greenBook ? "ready" : "used"} · 🍖 Cookout: {g.cookoutUsed ? "had" : "ready"}</div>
          {g.hasLeague() && (
            <div>
              <span className="font-bold text-gold">The League:</span>{" "}
              {g.leagueFormed ? "formed: Housing −1 every 2nd round; Housing & Lending traps beatable at Sight 1" : `${g.league.size}/${g.leagueNeeded()} signed this round`}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type Stop = { icon: IconName; title: string; body: ReactNode; state: "done" | "now" | "next" };

/** The road to victory, always on screen: where the block is, what's next, and what loses the game. */
function GoalTrack({ s, changes }: { s: Session; changes: Changes }) {
  const g = s.g;
  const total = g.totalClarity();
  const threads = g.threads.size;
  const need = g.threadsNeeded();
  const won = g.result === "BLOCK_WIN";
  const stops: Stop[] = [
    {
      icon: "clarity",
      title: "Wake the block",
      state: g.uwOpen ? "done" : "now",
      body: (
        <>
          <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <span className="block h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${Math.min(100, (total / K.UNDERWORLD_AT) * 100)}%` }} />
          </span>
          <span className="mt-0.5 block">
            Clarity <b>{Math.min(total, K.UNDERWORLD_AT)}</b>/{K.UNDERWORLD_AT} · {g.awake()} awake
          </span>
        </>
      ),
    },
    {
      icon: "door",
      title: "Underworld opens",
      state: g.uwOpen ? "done" : "next",
      body: g.uwOpen ? <>The Owner is out: <b>{g.ownerFace}</b></> : <>at Clarity {K.UNDERWORLD_AT}</>,
    },
    {
      icon: "clue",
      title: `Trace ${need} threads`,
      state: won || (g.uwOpen && threads >= need) ? "done" : g.uwOpen ? "now" : "next",
      body: (
        <>
          <Pips value={threads} max={need} color="#2F8FD8" /> <span className="ml-1">Sight 3 in an awake district</span>
        </>
      ),
    },
    { icon: "expose", title: "Expose the Owner", state: won ? "done" : g.canExpose() ? "now" : "next", body: g.canExpose() ? <b>Do it now: you win!</b> : <>you win</> },
  ];
  const captured = g.captured();
  const fallen = g.blk().filter((p) => p.flipped).length;
  const roundsLeft = K.MAX_ROUNDS - g.round;
  return (
    <div className="rounded-xl border border-gold/40 bg-black/25 p-2.5" aria-label="The road to victory">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stops.map((st, i) => (
          <li
            key={st.title}
            className={`relative rounded-lg border p-2 text-[11px] leading-snug transition ${
              st.state === "done" ? "border-gold/60 bg-gold/15" : st.state === "now" ? "border-gold bg-gold/10 shadow-[0_0_14px_rgba(242,182,50,0.35)]" : "border-white/15 opacity-60"
            }`}
          >
            <span className="flex items-center gap-1.5 text-xs font-black text-gold">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-night text-[10px]">{st.state === "done" ? "✓" : i + 1}</span>
              <Icon name={st.icon} size={14} color="#F2B632" />
              {st.title}
            </span>
            <span className="mt-1 block text-program/85">{st.body}</span>
            {i === 2 && changes?.delta.threads ? <Float key={changes.id} id={changes.id} n={changes.delta.threads} icon="clue" className="absolute -top-2 right-1" /> : null}
          </li>
        ))}
      </ol>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-program/75">
        <span className="font-black uppercase tracking-wider text-[#ff8a8a]">You lose if</span>
        <span className="inline-flex items-center gap-1">
          <Icon name="pressure" size={12} /> {K.LOSE_CAPTURED} districts captured <Pips value={captured} max={K.LOSE_CAPTURED} color="#E63946" />
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="clock" size={12} color="#ff8a8a" /> round {K.MAX_ROUNDS} ends ({roundsLeft} left)
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon name="corruption" size={12} /> everyone Falls ({fallen}/{g.blk().length})
        </span>
      </p>
    </div>
  );
}
