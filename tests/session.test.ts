/** The browser flow must carry whole games to an end, in every mode, without getting stuck. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import { Session, type Mode } from "../src/game/session";

function playOut(mode: Mode, players: number, seed: number, overlordHuman = false) {
  const s = new Session({ mode, roster: C.roster.slice(0, players), seed, overlordHuman });
  for (let step = 0; step < 5000 && s.phase !== "over"; step++) {
    const g = s.g;
    switch (s.phase) {
      case "cookout": s.cookout(g.cookoutAi()); break;
      case "turn": s.act(g.blockAi(s.player, "human")); break;
      case "fallen": s.fallenAct(g.machineAiMove(g.struck)); break;
      case "sousou": s.sousou(g.sousouAi()); break;
      case "overlord": s.overlordAct(g.machineAiMove(g.struck)); break;
      case "machine": s.nextRound(); break;
    }
  }
  return s;
}

describe("Session flow", () => {
  for (const mode of ["coop", "overlord", "chapter"] as Mode[])
    for (const n of [2, 3, 4, 5])
      for (const seed of [1, 2, 3])
        it(`${mode} ${n}p seed ${seed} reaches an ending`, () => {
          const s = playOut(mode, n, seed * 31 + n, mode === "overlord" && seed === 2);
          expect(s.phase).toBe("over");
          expect(s.g.result).not.toBeNull();
          expect(s.g.round).toBeLessThanOrEqual(12);
        });

  it("asks before the Cookout and lets the table decline", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), scenario: "A Quiet Year", seed: 5 });
    expect(s.phase).toBe("cookout");
    s.cookout(false);
    expect(s.phase).toBe("turn");
    expect(s.g.cookoutUsed).toBe(false);
  });

  it("a person's Overlord gets the right number of moves", () => {
    const s = new Session({ mode: "overlord", roster: C.roster.slice(0, 2), seed: 9, overlordHuman: true });
    while (s.phase !== "overlord" && s.phase !== "over") {
      if (s.phase === "cookout") s.cookout(false);
      else if (s.phase === "turn") s.endTurn();
      else if (s.phase === "sousou") s.sousou(false);
    }
    expect(s.movesLeft).toBe(s.g.overlordMoveCount());
  });
});
