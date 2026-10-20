/**
 * Every change to a game, as plain data. The engine is deterministic from its seed, so a game is
 * its config plus its list of moves: that's what a save holds, and what online play sends between
 * phones. Players travel by name and cards by their place in the district's deck.
 */
import type { Card, Choice, District, PlaceKey } from "../engine/content";
import type { Action, Game } from "../engine/engine";

/** a "sign now" deal's fake clock when the choice was made: still running, or waited out */
export type ClockTag = "rushed" | "waited";

/** a card, as its index in g.deck[d], or (rolled or dressed by the fine-print die) as x, its index in g.dealt */
export type WireCard = { d: District; i: number } | { d: District; x: number };

export function cardToWire(g: Game, d: District, card: Card): WireCard {
  const i = g.deck[d].indexOf(card);
  return i >= 0 ? { d, i } : { d, x: g.dealt.indexOf(card) };
}
export function cardFromWire(g: Game, w: WireCard): Card {
  return "x" in w ? g.dealt[w.x] : g.deck[w.d][w.i];
}

export type WireAction =
  | { k: "study" | "history" | "trace"; d: District }
  | { k: "face"; d: District; choice: Choice; card?: WireCard; clock?: ClockTag; by?: string }
  | { k: "teach"; t: string; d: District; response?: boolean }
  | { k: "commons"; place: PlaceKey }
  | { k: "reach"; t: string }
  | { k: "expose_uw" | "league" | "march" | "leave_desk" | "pass" }
  | { k: "m_extract" | "m_obscure" | "m_counterfeit"; d: District }
  | { k: "m_tempt"; t: string | null };

export type Move =
  | { t: "cookout"; call: boolean; picks?: Record<string, District> }
  | { t: "act"; a: WireAction }
  | { t: "end" }
  | { t: "fallen"; a: WireAction }
  | { t: "sousou"; hand: boolean; d?: District }
  | { t: "overlord"; a: WireAction }
  | { t: "next" }
  /** draw the deal (or two, after shopping around) the current player will face */
  | { t: "deal"; d: District }
  /** draw the card read aloud in a Teach's call and response */
  | { t: "teachCard"; to: string; d: District }
  /** the table's Green Book setting */
  | { t: "greenbook"; on: boolean }
  /** Book One, Chapter 2: who takes the Desk at the start of round 2 (null: nobody) */
  | { t: "desk"; who: string | null }
  /** Book One, Chapter 3: the Overlord offers the Crown; the player wears it or refuses */
  | { t: "crown"; to: string; wear: boolean }
  /** Book One, Chapter 3, with a person playing the Overlord: offer the Crown to someone (null: not this round) */
  | { t: "crownOffer"; to: string | null };

export function toWire(g: Game, a: Action): WireAction {
  switch (a.k) {
    case "face":
      return { k: "face", d: a.d, choice: a.choice, ...(a.card ? { card: cardToWire(g, a.d, a.card) } : {}), ...(a.by ? { by: a.by.name } : {}) };
    case "teach":
      return { k: "teach", t: a.t.name, d: a.d, ...(a.response === undefined ? {} : { response: a.response }) };
    case "reach":
      return { k: "reach", t: a.t.name };
    case "m_tempt":
      return { k: "m_tempt", t: a.t?.name ?? null };
    default:
      return a;
  }
}

export function fromWire(g: Game, w: WireAction): Action {
  const who = (name: string) => {
    const p = g.players.find((x) => x.name === name);
    if (!p) throw new Error(`No player named ${name}`);
    return p;
  };
  switch (w.k) {
    case "face":
      return { k: "face", d: w.d, choice: w.choice, card: w.card ? cardFromWire(g, w.card) : undefined, by: w.by ? who(w.by) : undefined };
    case "teach":
      return { k: "teach", t: who(w.t), d: w.d, response: w.response };
    case "reach":
      return { k: "reach", t: who(w.t) };
    case "m_tempt":
      return { k: "m_tempt", t: w.t === null ? null : who(w.t) };
    default:
      return w;
  }
}
