/** The board shows what each step changed: the diff must catch every visible change and nothing else. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import { Session } from "../src/game/session";
import { diff, signed, snap } from "../src/ui/changes";

describe("Step changes", () => {
  it("reports nothing when nothing changed", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 3 });
    expect(diff(snap(s.g), snap(s.g))).toBeNull();
  });

  it("reports a Study as +1 Sight for that player in that district", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 3 });
    if (s.phase === "cookout") s.cookout(false);
    const p = s.player;
    const before = snap(s.g);
    s.act({ k: "study", d: "HOUSING" });
    const d = diff(before, snap(s.g))!;
    expect(d.players[p.name].sight).toEqual({ HOUSING: 1 });
    expect(d.players[p.name].legend).toBe(1);
    expect(d.districts).toEqual({});
  });

  it("reports the Machine's strikes as Pressure on the districts", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 8 });
    // pass every turn and every question until the Machine has moved (the round-1 grace round excepted)
    const toMachine = () => {
      for (let i = 0; i < 50 && s.phase !== "machine" && s.phase !== "over"; i++) {
        if (s.phase === "cookout") s.cookout(false);
        else if (s.phase === "turn") s.endTurn();
        else if (s.phase === "sousou") s.sousou(false);
      }
    };
    toMachine();
    s.nextRound();
    const before = snap(s.g);
    toMachine();
    const d = diff(before, snap(s.g))!;
    const hit = Object.values(d.districts).filter((x) => (x.pressure ?? 0) > 0 || (x.clarity ?? 0) < 0);
    expect(hit.length).toBeGreaterThan(0);
  });

  it("signs numbers with a real minus", () => {
    expect(signed(2)).toBe("+2");
    expect(signed(-1)).toBe("−1");
  });
});
