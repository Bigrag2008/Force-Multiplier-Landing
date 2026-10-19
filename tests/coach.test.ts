/** The Coach must only read the game, never peek at hidden layers, and give advice a player can follow to a win. */
import { describe, expect, it } from "vitest";
import { C, DISTRICTS, type Card, type District } from "../src/engine/content";
import { maxBy, type Action, type Game } from "../src/engine/engine";
import { adviseCookout, adviseDeal, adviseSousou, adviseTurn, lessonsDue, type TurnPick } from "../src/game/coach";
import { Session, type Mode } from "../src/game/session";

/** everything the engine holds, as plain data (Sets as arrays, the RNG's internal state included) */
const snap = (g: Game) =>
  JSON.stringify(g, (_k, v) => (v instanceof Set ? [...v].sort() : typeof v === "function" ? undefined : v));

function toAction(s: Session, pick: TurnPick): Action {
  const g = s.g;
  const p = s.player;
  switch (pick.k) {
    case "face": {
      const cards = g.dealsFor(p, pick.d);
      const rank = (c: Card) => ({ NEGOTIATE: 3, TAKE: 2, WALK: 1 })[adviseDeal(g, p, pick.d, c).pick] ?? 0;
      const card = maxBy(cards, rank);
      return { k: "face", d: pick.d, card, choice: adviseDeal(g, p, pick.d, card).pick };
    }
    case "teach":
      g.draw(pick.d); // the call-and-response card the UI shows
      return { k: "teach", d: pick.d, t: g.players.find((x) => x.name === pick.t)!, response: true };
    case "reach": return { k: "reach", t: g.players.find((x) => x.name === pick.t)! };
    default: return pick as Action;
  }
}

/** a whole game played by doing what the Coach says */
function coached(mode: Mode, n: number, seed: number, scenario?: string) {
  const s = new Session({ mode, roster: C.roster.slice(0, n), seed, scenario });
  for (let step = 0; step < 5000 && s.phase !== "over"; step++) {
    const g = s.g;
    switch (s.phase) {
      case "cookout": s.cookout(adviseCookout(g).pick); break;
      case "turn": s.act(toAction(s, adviseTurn(g, s.player, s.actionsLeft).pick)); break;
      case "fallen": s.fallenAct(g.machineAiMove(g.struck)); break;
      case "sousou": s.sousou(adviseSousou(s).pick, maxBy(DISTRICTS, (d) => g.pressure[d])); break;
      case "overlord": s.overlordAct(g.machineAiMove(g.struck)); break;
      case "machine": s.nextRound(); break;
    }
  }
  return s;
}

/** the same table played by the engine's default bot, for comparison */
function botGame(mode: Mode, n: number, seed: number, scenario?: string) {
  const s = new Session({ mode, roster: C.roster.slice(0, n), seed, scenario });
  for (let step = 0; step < 5000 && s.phase !== "over"; step++) {
    const g = s.g;
    switch (s.phase) {
      case "cookout": s.cookout(g.cookoutAi()); break;
      case "turn": s.act(g.blockAi(s.player, "human")); break;
      case "fallen": s.fallenAct(g.machineAiMove(g.struck)); break;
      case "sousou": s.sousou(g.sousouAi()); break;
      case "machine": s.nextRound(); break;
    }
  }
  return s;
}

describe("The Coach", () => {
  it("never changes the game or draws from the deck", () => {
    for (const seed of [3, 8, 21]) {
      const s = new Session({ mode: "coop", roster: C.roster.slice(0, 4), seed });
      for (let step = 0; step < 400 && s.phase !== "over"; step++) {
        const g = s.g;
        const before = snap(g);
        if (s.phase === "turn") {
          adviseTurn(g, s.player, s.actionsLeft);
          for (const d of DISTRICTS) for (const card of C.deck[d].slice(0, 6)) adviseDeal(g, s.player, d, card);
        }
        adviseCookout(g);
        if (s.phase === "sousou") adviseSousou(s);
        lessonsDue(s, "deal", 1);
        expect(snap(g)).toBe(before);
        switch (s.phase) {
          case "cookout": s.cookout(g.cookoutAi()); break;
          case "turn": s.act(g.blockAi(s.player, "human")); break;
          case "fallen": s.fallenAct(g.machineAiMove(g.struck)); break;
          case "sousou": s.sousou(g.sousouAi()); break;
          case "machine": s.nextRound(); break;
        }
      }
    }
  });

  it("at Sight 0 gives the same advice for a trap and an honest deal", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 4 });
    const g = s.g;
    const p = g.players[0];
    for (const d of DISTRICTS) {
      const trap = C.deck[d].find((c) => c.trap)!;
      const honest = C.deck[d].find((c) => !c.trap)!;
      p.sight[d] = 0;
      for (const pressure of [0, 1, 2]) {
        g.pressure[d] = pressure;
        expect(adviseDeal(g, p, d, trap)).toEqual(adviseDeal(g, p, d, honest));
      }
    }
  });

  it("lays the shortcut beside its pick on a trap, with the true cost", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 4 });
    const g = s.g;
    const p = g.players[0];
    const trap = C.deck.LENDING.find((c) => c.trap)!;
    const honest = C.deck.LENDING.find((c) => !c.trap)!;
    p.sight.LENDING = 3;
    p.trust = 3;
    p.corruption = 0;
    g.pressure.LENDING = 1;
    const a = adviseDeal(g, p, "LENDING", trap);
    expect(a.pick).toBe("NEGOTIATE");
    expect(a.alt?.pick).toBe("TAKE");
    expect(a.alt?.falls).toBe(false);
    expect(a.alt?.why).toContain("drops by 2");
    g.pressure.LENDING = 0;
    expect(adviseDeal(g, p, "LENDING", trap).alt?.why).toContain("+2 Clarity");
    p.corruption = 5;
    expect(adviseDeal(g, p, "LENDING", trap).alt?.falls).toBe(true);
    // an honest deal you can read is just good help: no shortcut to offer
    expect(adviseDeal(g, p, "LENDING", honest).alt).toBeUndefined();
  });

  it("only recommends what the player can afford", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed });
      for (let step = 0; step < 2000 && s.phase !== "over"; step++) {
        const g = s.g;
        if (s.phase === "turn") {
          const p = s.player;
          const { pick } = adviseTurn(g, p, s.actionsLeft);
          if (pick.k === "reach") expect(p.trust).toBeGreaterThanOrEqual(2);
          if (pick.k === "trace") expect(g.canTrace(p, pick.d)).toBe(true);
          if (pick.k === "expose_uw") expect(g.canExpose()).toBe(true);
          if (pick.k === "history") expect(p.role === "Elder" && !p.elderUsed).toBe(true);
          if (pick.k === "teach") expect(pick.t).not.toBe(p.name);
          const action = toAction(s, pick);
          if (action.k === "face" && action.choice === "NEGOTIATE") expect(p.trust).toBeGreaterThanOrEqual(g.negCost(action.d));
          s.act(action);
          continue;
        }
        switch (s.phase) {
          case "cookout": s.cookout(adviseCookout(g).pick); break;
          case "fallen": s.fallenAct(g.machineAiMove(g.struck)); break;
          case "sousou": s.sousou(adviseSousou(s).pick, maxBy(DISTRICTS, (d: District) => g.pressure[d])); break;
          case "machine": s.nextRound(); break;
        }
      }
      expect(s.phase).toBe("over");
    }
  });

  it("wins far more often than the default bot when a table follows it", () => {
    // g.won only means the game is over; a block win is result === "BLOCK_WIN"
    const rate = (mode: Mode, scenario: string | undefined, follow: boolean) => {
      let wins = 0;
      for (let i = 0; i < 120; i++) {
        const s = follow ? coached(mode, 3, 1000 + i, scenario) : botGame(mode, 3, 1000 + i, scenario);
        expect(s.phase).toBe("over");
        if (s.g.result === "BLOCK_WIN") wins++;
      }
      return wins / 120;
    };
    const audit = rate("coop", "The Audit", true);
    const chapter = rate("chapter", undefined, true);
    console.log("Coach win rates", { audit, auditBot: rate("coop", "The Audit", false), chapter });
    expect(audit).toBeGreaterThanOrEqual(0.7);
    expect(audit).toBeGreaterThan(rate("coop", "The Audit", false) + 0.2);
    expect(chapter).toBeGreaterThanOrEqual(0.3);
  });

  it("teaches the welcome first, then the deal lessons when a deal is open", () => {
    const s = new Session({ mode: "coop", roster: C.roster.slice(0, 3), seed: 2 });
    if (s.phase === "cookout") s.cookout(false);
    expect(lessonsDue(s)[0].id).toBe("welcome");
    expect(lessonsDue(s).map((l) => l.id)).toContain("turn");
    expect(lessonsDue(s, "deal", 0).map((l) => l.id)).toContain("blind");
    expect(lessonsDue(s, "deal", 2).map((l) => l.id)).toContain("glasses");
  });
});
