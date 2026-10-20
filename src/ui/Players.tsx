"use client";
import { C, K } from "../engine/content";
import type { Session } from "../game/session";
import { t, tDistrict, useLang } from "../i18n";
import { RolePortrait } from "./art/RolePortrait";
import { Float, type Changes } from "./Board";
import { Icon, Pips } from "./icons";
import { DISTRICT_COLOR, DISTRICT_SURFACE, titleCase } from "./theme";

export function Players({ s, changes = null }: { s: Session; changes?: Changes }) {
  useLang();
  const g = s.g;
  return (
    <section aria-label={t("The block")} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {g.players.map((p, i) => {
        const current = (s.phase === "turn" || s.phase === "fallen") && s.seat === i;
        if (p.role === "Overlord")
          return (
            <div key={p.name} className="rounded-xl border border-[#E63946]/60 bg-[#E63946]/10 p-3">
              <div className="font-black text-[#ff8a8a]">⚑ {t("{name}: the Overlord", { name: p.name })}</div>
              <div className="text-xs text-program/80">{t("The Machine, in the flesh.")}</div>
            </div>
          );
        const ch = changes?.delta.players[p.name];
        // Shady you can see: ink spreads when it goes up, and the card breathes purple near the edge
        const limit = g.party ? K.BP_SIT_OUT : K.FLIP;
        const edge = !p.flipped && p.corruption > 0 && p.corruption >= limit - (g.party ? 1 : 2);
        return (
          <div
            key={p.name}
            className={`relative overflow-visible rounded-xl border p-3 transition-[filter,background-color] duration-700 ${
              p.flipped ? "border-[#7b3fd1] bg-[#2a1446]" : edge ? "edge-pulse border-[#b07cff] bg-[#b07cff]/10" : current ? "border-gold bg-gold/10" : "border-white/15 bg-white/5"
            }`}
            // a Fallen player's card drains of color: the Machine is moving through them
            style={p.flipped ? { filter: "saturate(0.35)" } : undefined}
          >
            {(ch?.corruption ?? 0) > 0 && (
              <span
                key={changes!.id}
                aria-hidden
                className="ink pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: "radial-gradient(circle at 70% 40%, rgba(123,63,209,0.75), rgba(123,63,209,0.25) 45%, transparent 70%)" }}
              />
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <RolePortrait role={p.role} size={40} title={t("{name}, {role}", { name: p.name, role: theRole(p.role) })} />
                <div>
                  <span className="font-black">{p.name}</span> <span className="text-xs text-program/70">{theRole(p.role)}</span>
                </div>
              </div>
              {p.flipped ? (
                <span className="text-xs font-black text-[#ff8a8a]">{t("FALLEN")}</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-gold" title={t("Props: earned by lifting people")}>
                  <Icon name="legend" size={13} /> {p.legend}
                </span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-program/70">{C.roles[p.role] ? t(C.roles[p.role]) : t("A neighbor on the block.")}</div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1" title={t("Trust: pays for negotiating and teaching")}>
                <Icon name="trust" size={13} /> {t("Trust")} <Pips value={p.trust} max={K.MAX_TRUST} color="#ff7a90" />
              </span>
              <span className="inline-flex items-center gap-1" title={g.party ? t("Shady: at {n} you sit out a turn", { n: K.BP_SIT_OUT }) : t("Shady: at {n} you Fall", { n: K.FLIP })}>
                <Icon name="corruption" size={13} /> {t("Shady")} <Pips value={p.corruption} max={g.party ? K.BP_SIT_OUT : K.FLIP} color="#b07cff" danger={g.party ? K.BP_SIT_OUT : K.FLIP} />
              </span>
              {p.role === "Veteran" && <span>{t("Shields {n}", { n: p.shields })}</span>}
              {p.role === "Elder" && <span>{p.elderUsed ? t("History told") : t("History ready")}</span>}
            </div>
            <div className="mt-2 flex items-center gap-1" role="group" aria-label={t("Read by district")}>
              <Icon name="sight" size={14} title={t("Read: how well you read each district")} />
              {g.ds.map((d) => (
                <div
                  key={d}
                  title={t("{d}: Read {n}", { d: tDistrict(d), n: p.sight[d] })}
                  role="img"
                  aria-label={t("{d}: Read {n}", { d: titleCase(d), n: p.sight[d] })}
                  className="relative flex-1 whitespace-nowrap rounded border px-1 py-0.5 text-center text-[10px] font-bold"
                  // Read 0 is an outline, not a faded fill, so the label stays readable
                  style={p.sight[d] ? { background: DISTRICT_SURFACE[d].bg, borderColor: DISTRICT_SURFACE[d].bg, color: DISTRICT_SURFACE[d].fg } : { borderColor: DISTRICT_COLOR[d], color: "#cfc8df" }}
                >
                  <span aria-hidden>{tDistrict(d).slice(0, 3)} {p.sight[d]}</span>
                  {ch?.sight?.[d] ? <Float key={changes!.id} id={changes!.id} n={ch.sight[d]!} icon="sight" className="absolute -top-4 left-1/2 -translate-x-1/2" /> : null}
                </div>
              ))}
            </div>
            {ch && (ch.trust || ch.corruption || ch.legend) ? (
              <div className="pointer-events-none absolute -top-2 right-2 flex gap-1">
                {ch.trust ? <Float key={changes!.id} id={changes!.id} n={ch.trust} icon="trust" /> : null}
                {ch.corruption ? <Float key={changes!.id} id={changes!.id} n={ch.corruption} icon="corruption" /> : null}
                {ch.legend ? <Float key={changes!.id} id={changes!.id} n={ch.legend} icon="legend" /> : null}
              </div>
            ) : null}
            {(p.freeTeach || p.shopAround || p.practice) && current && (
              <div className="mt-1 text-[11px] text-gold">
                {p.freeTeach && `${t("Next Teach free.")} `}
                {p.shopAround && `${t("Next deal: draw 2.")} `}
                {p.practice && `${t("Next Study +2.")} `}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

/** "the Translator" / "el Traductor" (a role nobody translated stays "the …") */
export const theRole = (role: string) => t(`the ${role}`);
