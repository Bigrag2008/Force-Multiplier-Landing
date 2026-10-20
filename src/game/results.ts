/**
 * The teacher's view: what one finished game says about a table, as plain data. There is no server.
 * A finished game is saved on the device that played it, and can travel to a teacher as a short
 * result code the student copies; the teacher's page collects codes on the teacher's own device.
 */
import { C, type District } from "../engine/content";
import type { Signed } from "../engine/engine";
import type { Session } from "./session";

export interface GameResult {
  v: 1;
  /** the same game always gets the same id, so pasting a code twice doesn't count it twice */
  id: string;
  at: number;
  /** the table's name as the students typed it (optional) */
  table: string;
  names: string[];
  mode: string;
  won: boolean;
  rounds: number;
  maxRounds: number;
  money: { taken: number; played: number; refused: number; dodged: number; defused: number; help: number };
  clock: { rushed: number; waited: number };
  /** the deals that fooled this table: signed as a shortcut, got played on, conned by, or walked away from (honest) */
  fooled: { front: string; d: District; out: Signed["out"] }[];
  /** average final Read across the block and the districts in play (0–3) */
  read: number;
  props: number;
}

const FOOLED: Signed["out"][] = ["taken", "played", "conned", "refused"];

export function summarize(s: Session, table = ""): GameResult {
  const g = s.g;
  const m = g.money();
  const block = g.blk();
  const reads = block.flatMap((p) => g.ds.map((d) => p.sight[d]));
  return {
    v: 1,
    id: `${s.config.seed}-${s.moves.length}-${g.round}`,
    at: Date.now(),
    table: table.trim().slice(0, 40),
    names: block.map((p) => p.name),
    mode: g.overlord ? "Overlord" : g.party ? "Block Party" : g.chapter ? `Chapter ${g.chapter.number}` : "Co-op",
    won: g.result === "BLOCK_WIN",
    rounds: g.round,
    maxRounds: g.maxRounds,
    money: { taken: m.taken, played: m.played, refused: m.refused, dodged: m.dodged, defused: m.defused, help: m.help },
    clock: { rushed: s.clock.rushed, waited: s.clock.waited },
    fooled: g.signed.filter((x) => FOOLED.includes(x.out)).slice(0, 24).map((x) => ({ front: x.front.slice(0, 90), d: x.d, out: x.out })),
    read: reads.length ? Math.round((reads.reduce((a, b) => a + b, 0) / reads.length) * 100) / 100 : 0,
    props: block.reduce((a, p) => a + p.legend, 0),
  };
}

// ---- the result code: "SN1." + the summary as base64url JSON ----
const PREFIX = "SN1.";
export function encodeResult(r: GameResult): string {
  const bytes = new TextEncoder().encode(JSON.stringify(r));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeResult(code: string): GameResult | null {
  try {
    const t = code.trim();
    if (!t.startsWith(PREFIX)) return null;
    const b64 = t.slice(PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const r = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))) as GameResult;
    const ok = r?.v === 1 && typeof r.id === "string" && typeof r.won === "boolean" && r.money && Array.isArray(r.fooled) && Array.isArray(r.names);
    return ok ? r : null;
  } catch {
    return null;
  }
}
/** every result code in a block of pasted text (one per line, or run together) */
export function decodeAll(text: string): { results: GameResult[]; bad: number } {
  const codes = text.match(/SN1\.[A-Za-z0-9_-]+/g) ?? [];
  const results = codes.map(decodeResult).filter((r): r is GameResult => !!r);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { results, bad: codes.length - results.length + Math.max(0, words - codes.length) };
}

// ---- kept on the device ----
export const HISTORY = "sn-results"; // games finished on this device
export const CLASS = "sn-class"; // codes a teacher has collected
export function loadList(key: string): GameResult[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(list) ? list.filter((r) => r?.v === 1) : [];
  } catch {
    return [];
  }
}
export function saveList(key: string, list: GameResult[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list.slice(-300)));
  } catch {
    // no storage: the results just aren't kept
  }
}
/** add results, skipping any already there (same game id) */
export function addResults(list: GameResult[], more: GameResult[]): GameResult[] {
  const seen = new Set(list.map((r) => r.id));
  const out = [...list];
  for (const r of more) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out.sort((a, b) => a.at - b.at);
}

// ---- the class picture ----
export interface ClassPicture {
  games: number;
  wins: number;
  rounds: number;
  read: number;
  money: GameResult["money"];
  clock: GameResult["clock"];
  /** the deals that fooled the most tables, worst first */
  fooled: { front: string; d: District; times: number; outs: Partial<Record<Signed["out"], number>>; red?: string; blue?: string; trap?: boolean; counterfeit?: boolean; basis?: string; dollars?: number }[];
}
export function classPicture(list: GameResult[]): ClassPicture {
  const sum = (f: (r: GameResult) => number) => list.reduce((a, r) => a + f(r), 0);
  const money = { taken: 0, played: 0, refused: 0, dodged: 0, defused: 0, help: 0 };
  for (const r of list) for (const k of Object.keys(money) as (keyof typeof money)[]) money[k] += r.money[k] ?? 0;
  const by = new Map<string, ClassPicture["fooled"][number]>();
  for (const r of list)
    for (const f of r.fooled) {
      const key = `${f.d}|${f.front}`;
      const row = by.get(key) ?? { front: f.front, d: f.d, times: 0, outs: {} };
      row.times += 1;
      row.outs[f.out] = (row.outs[f.out] ?? 0) + 1;
      by.set(key, row);
    }
  // fill in what the printed card says, so the class can talk it through
  const cards = [...Object.entries(C.deck), ...Object.entries(C.counterfeits).map(([d, c]) => [d, [c]] as const)];
  for (const row of by.values()) {
    const card = cards.find(([d]) => d === row.d)?.[1].find((c) => c.front.startsWith(row.front)) ??
      cards.flatMap(([, cs]) => cs).find((c) => c.front.startsWith(row.front));
    if (card) Object.assign(row, { red: card.red, blue: card.blue, trap: card.trap, counterfeit: !!card.counterfeit, basis: card.basis, dollars: card.dollars });
  }
  return {
    games: list.length,
    wins: sum((r) => (r.won ? 1 : 0)),
    rounds: list.length ? sum((r) => r.rounds) / list.length : 0,
    read: list.length ? sum((r) => r.read) / list.length : 0,
    money,
    clock: { rushed: sum((r) => r.clock.rushed), waited: sum((r) => r.clock.waited) },
    fooled: [...by.values()].sort((a, b) => b.times - a.times || a.front.localeCompare(b.front)),
  };
}

/** a spreadsheet of the games, one row each */
export function toCsv(list: GameResult[]): string {
  const q = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["date", "table", "players", "mode", "result", "rounds", "avg read", "traps signed $", "stayed out of $", "got played $", "real help walked away from $", "real help taken $", "clock: rushed", "clock: waited"];
  const rows = list.map((r) => [
    new Date(r.at).toISOString().slice(0, 10), r.table, r.names.join(" / "), r.mode, r.won ? "won" : "lost", r.rounds, r.read,
    r.money.taken, r.money.defused + r.money.dodged, r.money.played, r.money.refused, r.money.help, r.clock.rushed, r.clock.waited,
  ]);
  return [head, ...rows].map((row) => row.map(q).join(",")).join("\n");
}
