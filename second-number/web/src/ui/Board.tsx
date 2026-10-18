"use client";
import { C, DISTRICTS, K, type District } from "../engine/content";
import type { Session } from "../game/session";
import { DISTRICT_COLOR, titleCase } from "./theme";

function Track({ value, max, color, label, end }: { value: number; max: number; color: string; label: string; end: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-bold uppercase">
        <span>{label}</span>
        <span style={{ color }}>{end}</span>
      </div>
      <div className="mt-0.5 grid grid-cols-4 gap-1" aria-label={`${label} ${value} of ${max}`}>
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

function DistrictBlock({ s, d, highlight }: { s: Session; d: District; highlight?: boolean }) {
  const g = s.g;
  const c = g.clarity[d];
  const p = g.pressure[d];
  const status =
    p >= K.CAPTURE ? { t: "CAPTURED", c: "#E63946" } : c >= K.WAKE ? { t: "AWAKE", c: "#F2B632" } : p >= K.GRIP ? { t: "gripped", c: "#E63946" } : null;
  return (
    <div
      className={`rounded-xl border-2 bg-white text-ink shadow ${highlight ? "ring-4 ring-gold" : ""}`}
      style={{ borderColor: DISTRICT_COLOR[d] }}
    >
      <div className="rounded-t-lg px-2 py-1.5 text-center text-white" style={{ background: DISTRICT_COLOR[d] }}>
        <div className="text-sm font-black tracking-wide">{d}</div>
        <div className="text-[10px] italic opacity-90">{C.dayton[d].sub}</div>
      </div>
      <div className="space-y-2 p-2">
        <Track value={c} max={K.WAKE} color={DISTRICT_COLOR[d]} label="Clarity" end="3 = awake" />
        <Track value={p} max={K.CAPTURE} color="#E63946" label="Machine" end="3 = captured" />
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-black" style={{ color: status?.c }}>{status?.t ?? " "}</span>
          {g.threads.has(d) ? <span className="font-bold text-[#2F8FD8]">🔵 thread</span> : null}
          {g.struck.has(d) && s.phase !== "machine" ? <span className="text-black/40">struck</span> : null}
        </div>
      </div>
    </div>
  );
}

export function Board({ s, highlight }: { s: Session; highlight?: District | null }) {
  const g = s.g;
  const patterns = g.activePatterns();
  const total = g.totalClarity();
  return (
    <section aria-label="The West Dayton board" className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {DISTRICTS.map((d) => (
          <DistrictBlock key={d} s={s} d={d} highlight={highlight === d} />
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
          <div className="font-black text-gold">The Underworld</div>
          {g.uwOpen ? (
            <p>
              Open. Threads <b>{g.threads.size}/{g.threadsNeeded()}</b>: trace with Sight 3 in an awake district, then expose the Owner.
            </p>
          ) : (
            <p>
              Total Clarity <b>{total}</b> / {K.UNDERWORLD_AT}. At {K.UNDERWORLD_AT} it cracks open.
            </p>
          )}
          <p className="mt-1 text-program/80">
            Owner: {g.ownerShown ? <b className="text-gold">{g.ownerFace}</b> : <span>hidden. Watch the board and deduce it.</span>}
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
