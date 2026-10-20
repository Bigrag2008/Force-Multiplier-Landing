/**
 * A block that remembers: a light campaign for casual players. After each full co-op game, the block
 * keeps what happened: districts it woke start the next game a step ahead (Clarity +1), districts it
 * lost carry a scar (Squeeze +1), and after a loss the community rallies (everyone +1 Trust). One
 * block per Your City edition, kept on this device.
 */
import { K, type District } from "../engine/content";
import type { Carry, Game } from "../engine/engine";
import { t, tDistrictTitle } from "../i18n";

export interface BlockMemory {
  games: number;
  wins: number;
  /** what the next game starts with */
  carry: Carry;
  /** the last game remembered, so a reload doesn't count it twice */
  lastId: string;
}
const KEY = "sn-block";

function all(): Record<string, BlockMemory> {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
export function loadBlock(editionId: string): BlockMemory | null {
  return all()[editionId] ?? null;
}
export function forgetBlock(editionId: string) {
  try {
    const m = all();
    delete m[editionId];
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // nothing to forget
  }
}

/** what a finished game leaves behind for the next one */
export function carryFrom(g: Game): Carry {
  // a district the Machine captured carries the scar, even if it had been woken
  const lost = g.ds.filter((d) => g.pressure[d] >= K.CAPTURE);
  const woke = g.ds.filter((d) => g.clarity[d] >= K.WAKE && !lost.includes(d));
  return {
    clarity: Object.fromEntries(woke.map((d) => [d, 1])) as Partial<Record<District, number>>,
    pressure: Object.fromEntries(lost.map((d) => [d, 1])) as Partial<Record<District, number>>,
    rally: g.result !== "BLOCK_WIN",
  };
}

/** remember a finished game (once): returns the block's memory now */
export function rememberGame(editionId: string, gameId: string, g: Game): BlockMemory {
  const m = all();
  const prev = m[editionId];
  if (prev?.lastId === gameId) return prev;
  const next: BlockMemory = {
    games: (prev?.games ?? 0) + 1,
    wins: (prev?.wins ?? 0) + (g.result === "BLOCK_WIN" ? 1 : 0),
    carry: carryFrom(g),
    lastId: gameId,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...m, [editionId]: next }));
  } catch {
    // no storage: the block forgets
  }
  return next;
}

const T = (d: string) => tDistrictTitle(d as District);
/** "Housing starts stronger; Labor carries a scar; the community rallies" */
export function describeCarry(c: Carry): string {
  const strong = Object.keys(c.clarity ?? {}).map(T);
  const scars = Object.keys(c.pressure ?? {}).map(T);
  const parts = [
    ...(strong.length ? [strong.length === 1 ? t("{ds} starts stronger", { ds: strong[0] }) : t("{ds} start stronger", { ds: strong.join(", ") })] : []),
    ...(scars.length ? [scars.length === 1 ? t("{ds} carries a scar", { ds: scars[0] }) : t("{ds} carry a scar", { ds: scars.join(", ") })] : []),
    ...(c.rally ? [t("the community rallies (+1 Trust each)")] : []),
  ];
  return parts.length ? parts.join("; ") : t("a fresh start");
}
