/**
 * Every change to a game, as plain data. The engine is deterministic from its seed, so a game is
 * its config plus its list of moves: that's what a save holds, and what online play sends between
 * phones. Players travel by name and cards by their place in the district's deck.
 */
import type { Choice, District, PlaceKey } from "../engine/content";
import type { Action, Game } from "../engine/engine";

/** a card, as its index in g.deck[d] */
export type WireCard = { d: District; i: number };

export type WireAction =
  | { k: "study" | "history" | "trace"; d: District }
  | { k: "face"; d: District; choice: Choice; card?: WireCard }
  | { k: "teach"; t: string; d: District; response?: boolean }
  | { k: "commons"; place: PlaceKey }
  | { k: "reach"; t: string }
  | { k: "expose_uw" | "league" | "pass" }
  | { k: "m_extract" | "m_obscure"; d: District }
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
  | { t: "greenbook"; on: boolean };

export function toWire(g: Game, a: Action): WireAction {
  switch (a.k) {
    case "face":
      return { k: "face", d: a.d, choice: a.choice, ...(a.card ? { card: { d: a.d, i: g.deck[a.d].indexOf(a.card) } } : {}) };
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
      return { k: "face", d: w.d, choice: w.choice, card: w.card ? g.deck[w.card.d][w.card.i] : undefined };
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
