/**
 * Endless deals: TypeScript port of game/deal_gen.py. A template is a deal with blanks;
 * rolling the blanks makes a fresh card, so the second number has to be worked out, not
 * remembered. Must roll exactly like the Python (same RNG calls, same order).
 */
import { C, type Card, type District } from "./content";
import type { Rng } from "./rng";

/** num ÷ den rounded half up, in integers, so Python and JavaScript agree */
const halfUp = (num: number, den: number) => Math.floor((2 * num + den) / (2 * den));
const fmt = (v: unknown) => (typeof v === "number" ? v.toLocaleString("en-US") : String(v));
const fill = (text: string, v: Record<string, unknown>) => text.replace(/\{(\w+)\}/g, (_, k: string) => fmt(v[k]));

export function makeDeal(d: District, rng: Rng): Card {
  const t = rng.choice(C.dealTemplates[d]);
  const v: Record<string, number | string> = {};
  for (const k of C.slotOrder) if (k in t) v[k] = rng.choice(t[k] as (number | string)[]);
  const [x, y] = t.mul ?? ["a", "b"];
  if (x in v && y in v) v.ab = (v[x] as number) * (v[y] as number);
  const n = (k: string) => v[k] as number;
  v.total =
    t.calc === "mul" ? n("ab") : t.calc === "mul_add" ? n("ab") + n("c") : t.calc === "mul_sub" ? n("ab") - n("c")
      : t.calc === "add" ? n("s") + n("c") : halfUp(n("c") * 36500, n("ab"));
  if ("s" in v) v.over = n("total") - n("s");
  const trap = t.trap ?? true;
  return {
    front: fill(t.front, v), red: fill(t.red, v), amber: fill(t.amber, v), blue: fill(t.blue, v),
    trap, lever: trap ? (t.lever ?? 1) : 0, ask: fill(t.ask, v), answer: n("total"), gen: true,
    dollars: trap ? n(t.usd ?? ("over" in v ? "over" : "total")) : (t.worth as number),
    basis: trap ? "the numbers on this deal" : "what the real help is worth",
    rush: !!t.rush,
  };
}
