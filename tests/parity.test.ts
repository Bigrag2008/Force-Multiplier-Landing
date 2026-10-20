/**
 * Parity: the TypeScript engine must replay every golden game recorded from the
 * Python engine (scripts/make_golden.py) line for line, ending in the same state.
 */
import { describe, expect, it } from "vitest";
import golden from "./golden.json";
import { newGame, type Carry, type Game, type Style } from "../src/engine/engine";

interface GoldenGame {
  config: {
    mode: string; players: number; style: Style; seed: number; roster: string[][]; scenario?: string; owner?: string;
    rules?: { party?: boolean; finePrint?: boolean; terrell?: boolean; endless?: boolean; partial?: boolean; render?: boolean; carry?: Carry };
  };
  final: Record<string, unknown>;
  log: string[];
  chapterResult: Record<string, unknown> | null;
}

function snapshot(g: Game) {
  return {
    result: g.result, round: g.round, scenario: g.scenario, owner: g.owner, ownerFace: g.ownerFace,
    pressure: g.pressure, clarity: g.clarity, threads: [...g.threads].sort(), pot: g.pot, circle: g.circle,
    uwOpen: g.uwOpen, greenBook: g.greenBook, cookoutUsed: g.cookoutUsed, kitchenUsed: g.kitchenUsed,
    leagueFormed: g.leagueFormed, money: g.money(),
    players: g.players.map((p) => ({
      name: p.name, role: p.role, trust: p.trust, corruption: p.corruption, legend: p.legend,
      flipped: p.flipped, shields: p.shields, sight: p.sight, bare: [...p.bare].sort(), benched: p.benched, face: p.face,
    })),
  };
}

describe("TypeScript engine replays the Python engine's golden games", () => {
  for (const [i, gg] of (golden as unknown as GoldenGame[]).entries()) {
    const c = gg.config;
    const label = `#${i} ${c.mode} ${c.players}p ${c.style} seed ${c.seed}${c.scenario ? " " + c.scenario : ""}${c.owner ? " " + c.owner : ""}${c.rules ? " " + Object.keys(c.rules).join("+") : ""}`;
    it(label, () => {
      const g = newGame({
        overlord: c.mode === "overlord", seed: c.seed, chapter: c.mode === "chapter" ? "THE_MAP" : undefined,
        scenario: c.scenario, owner: c.owner, ...c.rules, roster: c.roster.map(([name, role]) => ({ name, role })),
      });
      g.runAuto(undefined, c.style);
      // compare logs first so a mismatch points at the first line that differs
      for (let n = 0; n < Math.max(g.log.length, gg.log.length); n++) {
        expect(g.log[n], `log line ${n}`).toBe(gg.log[n]);
      }
      expect(snapshot(g)).toEqual(gg.final);
      if (gg.chapterResult) expect(g.chapterResult()).toEqual(gg.chapterResult);
    });
  }
});
