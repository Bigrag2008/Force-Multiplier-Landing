/** The screen's sense of what a move meant (src/ui/readImpact.ts) must keep up with the engine's words. */
import { describe, expect, it } from "vitest";
import { C, type Card } from "../src/engine/content";
import { newGame, type Game } from "../src/engine/engine";
import { diff, snap } from "../src/ui/changes";
import { readImpact } from "../src/ui/readImpact";

const card = (trap = true, lever = 1): Card => ({ front: "test", red: "r", amber: "a", blue: "b", trap, lever });
const EMPTY = { districts: {}, players: {}, threads: 0 };

/** run one engine call and read what it meant, the way the game screen does */
function step(g: Game, fn: () => void) {
  const before = snap(g);
  const at = g.log.length;
  fn();
  return readImpact(g, g.log.slice(at), diff(before, snap(g)) ?? EMPTY);
}
const game = (o = {}) => newGame({ seed: 1, scenario: "A Quiet Year", owner: "The Algorithm", roster: C.roster.slice(0, 3), ...o });

describe("reading the impact of a move", () => {
  it("stamps every kind of decision", () => {
    const g = game();
    const p = g.players[0];
    p.sight.LENDING = 2;
    p.trust = 5;
    g.pressure.LENDING = 1;
    expect(step(g, () => g.face(p, "LENDING", "NEGOTIATE", card(true, 2))).verdict?.kind).toBe("defused");
    expect(step(g, () => g.face(p, "LENDING", "NEGOTIATE", card(true, 3))).verdict?.kind).toBe("played");
    expect(step(g, () => g.face(p, "LENDING", "TAKE", card(false, 0))).verdict?.kind).toBe("honest");
    expect(step(g, () => g.face(p, "LENDING", "TAKE", card())).verdict?.kind).toBe("shortcut");
    expect(step(g, () => g.face(p, "LENDING", "WALK", card())).verdict?.kind).toBe("walked");
    expect(step(g, () => g.face(p, "LENDING", "WALK", card(false, 0))).verdict?.kind).toBe("refused");
    expect(step(g, () => g.face(p, "LENDING", "NEGOTIATE", card(false, 0))).verdict?.kind).toBe("wasted");
  });

  it("a played negotiation shakes the screen; a defused one doesn't", () => {
    const g = game();
    const p = g.players[0];
    p.sight.HOUSING = 1;
    p.trust = 5;
    expect(step(g, () => g.face(p, "HOUSING", "NEGOTIATE", card(true, 3))).shake).toBe(true);
    expect(step(g, () => g.face(p, "HOUSING", "NEGOTIATE", card(true, 1))).shake).toBe(false);
  });

  it("the Machine's strikes come back in order, and a capture gets a banner", () => {
    const g = game();
    g.round = 2;
    g.pressure.HEALTH = 2;
    g.clarity.HEALTH = 1;
    g.clarity.LABOR = 2;
    g.greenBook = false;
    const i = step(g, () => g.machinePhase());
    expect(i.strikes.length).toBeGreaterThan(0);
    expect(i.strikes[0]).toBe("LABOR"); // closest to waking first
    expect(i.moments.some((m) => m.kind === "captured" && m.d === "HEALTH") || g.pressure.HEALTH < 3).toBe(true);
  });

  it("a district that wakes gets its lights", () => {
    const g = game();
    const p = g.players[0];
    p.sight.EDUCATION = 1;
    g.clarity.EDUCATION = 2;
    const i = step(g, () => g.face(p, "EDUCATION", "TAKE", card(false, 0)));
    expect(i.woke).toEqual(["EDUCATION"]);
    expect(i.moments.map((m) => m.kind)).toContain("awake");
  });

  it("the Fall, the Reach home, and the Terrell backfire", () => {
    const g = game({ terrell: true });
    const [a, b] = g.players;
    a.corruption = 5;
    const fall = step(g, () => g.face(a, "LABOR", "TAKE", card())).moments.find((m) => m.kind === "fallen");
    expect(fall?.title).toBe(`${a.name} has Fallen`);
    b.trust = 3;
    expect(step(g, () => g.reach(b, a)).moments.map((m) => m.kind)).toContain("reached");
    a.trust = 3;
    a.sight.HOUSING = 1;
    a.bare.add("HOUSING");
    const i = step(g, () => g.face(a, "HOUSING", "NEGOTIATE", card(true, 1)));
    expect(i.verdict?.kind).toBe("backfire");
  });

  it("Block Party: strikes muddy as they land, and the win gets its banner", () => {
    const g = newGame({ seed: 2, party: true, roster: C.roster.slice(0, 4).map((r) => ({ name: r.name, role: "Neighbor" })) });
    g.round = 1;
    g.clarity.HOUSING = 2;
    const i = step(g, () => g.machinePhase());
    expect(i.strikes).toContain("HOUSING");
    expect(i.muddied).toContain("HOUSING");
    const p = g.players[0];
    g.clarity.LENDING = 3;
    g.clarity.HOUSING = 2;
    p.sight.HOUSING = 1;
    const w = step(g, () => g.do(p, { k: "face", d: "HOUSING", choice: "TAKE", card: card(false, 0) }));
    expect(w.moments.map((m) => m.kind)).toEqual(expect.arrayContaining(["awake", "won"]));
  });

  it("counterfeits: conned, exposed, and the banner when one is slipped in", () => {
    const g = newGame({ seed: 1, overlord: true, roster: C.roster.slice(0, 3) });
    const ov = g.ov()!;
    const p = g.players[0];
    g.round = 2;
    const slip = step(g, () => g.mCounterfeit(ov.name, "HEALTH"));
    expect(slip.moments.map((m) => m.kind)).toContain("forged");
    p.sight.HEALTH = 1;
    const fake = g.draw("HEALTH");
    expect(g.looks(p, "HEALTH", fake).trap).toBe(false);
    const conned = step(g, () => g.face(p, "HEALTH", "TAKE", fake));
    expect(conned.verdict?.kind).toBe("conned");
    expect(conned.shake).toBe(true);
    p.sight.HEALTH = 3;
    p.trust = 3;
    const exposed = step(g, () => g.face(p, "HEALTH", "NEGOTIATE", { ...C.counterfeits.HEALTH }));
    expect(exposed.verdict?.kind).toBe("exposed");
  });
});
