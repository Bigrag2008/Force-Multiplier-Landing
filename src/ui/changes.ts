/** What a step changed on the board and on each player, so the screen can show it instead of only logging it. */
import { DISTRICTS, type District } from "../engine/content";
import type { Game } from "../engine/engine";

type PlayerStat = "trust" | "corruption" | "legend";
interface Snap {
  clarity: Record<District, number>;
  pressure: Record<District, number>;
  players: Record<string, Record<PlayerStat, number> & { sight: Record<District, number> }>;
  threads: number;
}
export interface Delta {
  /** e.g. { HOUSING: { clarity: 1, pressure: -1 } } */
  districts: Partial<Record<District, { clarity?: number; pressure?: number }>>;
  /** e.g. { Nia: { trust: 2, sight: { LENDING: 1 } } } */
  players: Record<string, Partial<Record<PlayerStat, number>> & { sight?: Partial<Record<District, number>> }>;
  threads: number;
}

export function snap(g: Game): Snap {
  return {
    clarity: { ...g.clarity },
    pressure: { ...g.pressure },
    players: Object.fromEntries(g.players.map((p) => [p.name, { trust: p.trust, corruption: p.corruption, legend: p.legend, sight: { ...p.sight } }])),
    threads: g.threads.size,
  };
}

/** null when nothing visible changed (reading a lesson, opening a menu) */
export function diff(a: Snap, b: Snap): Delta | null {
  const out: Delta = { districts: {}, players: {}, threads: b.threads - a.threads };
  let any = out.threads !== 0;
  for (const d of DISTRICTS) {
    const c = b.clarity[d] - a.clarity[d];
    const p = b.pressure[d] - a.pressure[d];
    if (c || p) {
      out.districts[d] = { ...(c ? { clarity: c } : {}), ...(p ? { pressure: p } : {}) };
      any = true;
    }
  }
  for (const name of Object.keys(b.players)) {
    const x = a.players[name];
    const y = b.players[name];
    if (!x) continue;
    const row: Delta["players"][string] = {};
    for (const k of ["trust", "corruption", "legend"] as PlayerStat[]) if (y[k] !== x[k]) row[k] = y[k] - x[k];
    const sight: Partial<Record<District, number>> = {};
    for (const d of DISTRICTS) if (y.sight[d] !== x.sight[d]) sight[d] = y.sight[d] - x.sight[d];
    if (Object.keys(sight).length) row.sight = sight;
    if (Object.keys(row).length) {
      out.players[name] = row;
      any = true;
    }
  }
  return any ? out : null;
}

export const signed = (n: number) => (n > 0 ? `+${n}` : `−${-n}`);
