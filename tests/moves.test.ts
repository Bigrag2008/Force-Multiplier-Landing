/** A game is its config plus its moves: replaying them must rebuild exactly the same game. */
import { describe, expect, it } from "vitest";
import { C } from "../src/engine/content";
import type { Game } from "../src/engine/engine";
import { adviseDeal, adviseTurn } from "../src/game/coach";
import { toWire, type Move, type WireAction } from "../src/game/moves";
import { Session, type Mode } from "../src/game/session";

const snap = (g: Game) => JSON.stringify(g, (_k, v) => (v instanceof Set ? [...v].sort() : typeof v === "function" ? undefined : v));

/** play a whole game the way the screens do: draw first, then face or teach with that card */
function playByMoves(mode: Mode, n: number, seed: number, overlordHuman = false) {
  const s = new Session({ mode, roster: C.roster.slice(0, n), seed, overlordHuman });
  const go = (m: Move) => expect(s.apply(m)).toBe(true);
  for (let step = 0; step < 6000 && s.phase !== "over"; step++) {
    const g = s.g;
    switch (s.phase) {
      case "cookout": go({ t: "cookout", call: g.cookoutAi() }); break;
      case "turn": {
        // the Coach decides without drawing cards or touching the dice, so the moves are the whole story
        const pick = adviseTurn(g, s.player, s.actionsLeft).pick;
        if (pick.k === "face") {
          go({ t: "deal", d: pick.d });
          const pd = s.pending!;
          const card = pd.k === "deal" ? pd.cards[0] : null!;
          go({ t: "act", a: toWire(g, { k: "face", d: pick.d, card, choice: adviseDeal(g, s.player, pick.d, card).pick }) });
        } else if (pick.k === "teach") {
          go({ t: "teachCard", to: pick.t, d: pick.d });
          go({ t: "act", a: { k: "teach", t: pick.t, d: pick.d, response: step % 2 === 0 } });
        } else if (pick.k === "reach") go({ t: "act", a: { k: "reach", t: pick.t } });
        else go({ t: "act", a: pick as WireAction });
        break;
      }
      case "fallen": go({ t: "fallen", a: toWire(g, g.machineAiMove(g.struck)) }); break;
      case "sousou": go({ t: "sousou", hand: g.sousouAi(), d: "HOUSING" }); break;
      case "overlord": go({ t: "overlord", a: toWire(g, g.machineAiMove(g.struck)) }); break;
      case "machine": go({ t: "next" }); break;
    }
    if (step === 7) go({ t: "greenbook", on: false });
  }
  return s;
}

describe("Moves", () => {
  for (const mode of ["coop", "overlord", "chapter"] as Mode[])
    for (const n of [2, 3, 5])
      it(`${mode} ${n}p: replaying the moves rebuilds the same game`, () => {
        const s = playByMoves(mode, n, 77 + n, mode === "overlord" && n === 3);
        expect(s.phase).toBe("over");
        const copy = Session.replay(JSON.parse(JSON.stringify(s.config)), JSON.parse(JSON.stringify(s.moves)));
        expect(snap(copy.g)).toBe(snap(s.g));
        expect(copy.phase).toBe(s.phase);
        // and halfway through, too (a save made mid-game)
        const half = Math.floor(s.moves.length / 2);
        const a = Session.replay(s.config, s.moves.slice(0, half));
        const b = Session.replay(s.config, s.moves.slice(0, half));
        expect(snap(a.g)).toBe(snap(b.g));
        expect(a.pending === null).toBe(b.pending === null);
      });

  it("fixes the seed, so an unseeded game can be rebuilt", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3) });
    expect(typeof s.config.seed).toBe("number");
  });

  it("refuses moves out of turn, and a drawn card can't be swapped", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 5 });
    if (s.phase === "cookout") s.apply({ t: "cookout", call: false });
    expect(s.apply({ t: "next" })).toBe(false);
    expect(s.apply({ t: "deal", d: "LENDING" })).toBe(true);
    expect(s.apply({ t: "act", a: { k: "study", d: "LENDING" } })).toBe(false);
    const drawn = s.pending!.k === "deal" ? s.pending!.cards[0] : null;
    const other = s.g.deck.LENDING.findIndex((c) => c !== drawn);
    expect(s.apply({ t: "act", a: { k: "face", d: "LENDING", choice: "WALK", card: { d: "LENDING", i: other } } })).toBe(false);
    expect(s.apply({ t: "act", a: { k: "face", d: "LENDING", choice: "WALK", card: { d: "LENDING", i: s.g.deck.LENDING.indexOf(drawn!) } } })).toBe(true);
    expect(s.pending).toBeNull();
  });
});
