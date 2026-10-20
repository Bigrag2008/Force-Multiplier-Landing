/** The browser flow must carry whole games to an end, in every mode, without getting stuck. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import { adviseDeal, adviseTurn } from "../src/game/coach";
import { toWire, type WireAction } from "../src/game/moves";
import { Session, type Mode, type SessionConfig } from "../src/game/session";

function playOut(mode: Mode, players: number, seed: number, overlordHuman = false, extra: Partial<SessionConfig> = {}) {
  const s = new Session({ mode, roster: C.roster.slice(0, players), seed, overlordHuman, ...extra });
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

  for (const n of [2, 3, 4, 5])
    for (const seed of [1, 2, 3])
      it(`Block Party ${n}p seed ${seed} ends within 8 rounds, on 3 districts`, () => {
        const s = playOut("party", n, seed * 17 + n, false, { roster: C.roster.slice(0, n).map((r) => ({ name: r.name, role: "Neighbor" })) });
        expect(s.phase).toBe("over");
        expect(s.g.round).toBeLessThanOrEqual(8);
        expect(s.g.ds).toHaveLength(3);
        expect(s.g.log.some((l) => /Sou-Sou|COOKOUT|UNDERWORLD|PATTERN/.test(l))).toBe(false);
      });

  it("a game with endless, fine-print deals saves as moves and replays exactly", () => {
    const config: SessionConfig = { mode: "coop", roster: C.roster.slice(0, 3), seed: 41, endless: true, finePrint: true, terrell: true };
    const s = new Session(config);
    for (let step = 0; step < 4000 && s.phase !== "over"; step++) {
      const g = s.g;
      if (s.phase === "cookout") s.apply({ t: "cookout", call: false });
      else if (s.phase === "turn") {
        // the Coach picks (it never draws), the deal is drawn through the session, as in the UI
        const a = adviseTurn(g, s.player, s.actionsLeft).pick;
        if (a.k === "face") {
          s.apply({ t: "deal", d: a.d });
          const card = s.pending!.k === "deal" ? s.pending!.cards[0] : undefined;
          expect(s.apply({ t: "act", a: toWire(g, { k: "face", d: a.d, choice: adviseDeal(g, s.player, a.d, card!).pick, card }) })).toBe(true);
        } else s.apply({ t: "act", a: a as WireAction });
      } else if (s.phase === "fallen") s.apply({ t: "fallen", a: toWire(g, g.machineAiMove(g.struck)) });
      else if (s.phase === "sousou") s.apply({ t: "sousou", hand: false });
      else if (s.phase === "machine") s.apply({ t: "next" });
    }
    expect(s.phase).toBe("over");
    expect(s.g.dealt.some((c) => c.gen)).toBe(true);
    const r = Session.replay(config, s.moves);
    expect(r.g.log).toEqual(s.g.log);
  });

  it("a 'sign now' decision is counted on the move itself, and replays", () => {
    const config: SessionConfig = { mode: "coop", roster: C.roster.slice(0, 2), scenario: "A Quiet Year", seed: 12 };
    const s = new Session(config);
    if (s.phase === "cookout") s.apply({ t: "cookout", call: false });
    // draw deals in Lending (it has the most rush cards) until one pushes a deadline; walk the rest
    let rush = null;
    for (let i = 0; i < 60 && !rush && s.phase === "turn"; i++) {
      s.apply({ t: "deal", d: "LENDING" });
      const card = s.pending!.k === "deal" ? s.pending!.cards[0] : null;
      if (card?.rush) rush = card;
      else s.apply({ t: "act", a: toWire(s.g, { k: "face", d: "LENDING", choice: "WALK", card: card! }) });
      while (s.phase !== "turn" && s.phase !== "over") {
        if (s.phase === "sousou") s.apply({ t: "sousou", hand: false });
        else if (s.phase === "machine") s.apply({ t: "next" });
        else if (s.phase === "cookout") s.apply({ t: "cookout", call: false });
      }
    }
    expect(rush).not.toBeNull();
    const wire = { ...toWire(s.g, { k: "face", d: "LENDING", choice: "TAKE", card: rush! }), clock: "rushed" } as WireAction;
    expect(s.apply({ t: "act", a: wire })).toBe(true);
    expect(s.clock).toEqual({ rushed: 1, waited: 0, rushedDollars: rush!.dollars });
    expect(Session.replay(config, s.moves).clock).toEqual(s.clock);
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
