/**
 * A campaign's memory between chapters: TypeScript port of game/campaign.py (CAMPAIGN.md, BOOK_ONE.md).
 * A campaign is plain data, so it saves as JSON in the browser. The engine reads it at setup
 * (newGame({ chapter, campaign })); after a chapter, advance() writes what happened into it.
 */
import { C, type District } from "./content";
import type { CampaignState, ChapterResult } from "./engine";

export const MAX_STICKERS = 2; // per district, Rebuilt and Scarred together

export function newState(campaign: "LEDGER" | "BOOK_ONE"): CampaignState {
  return { campaign, played: [], ledger: 0, stickers: {}, decisions: {}, flags: [], unlocks: [], rally: false, falls: 0, defend: true, quit_desk: null };
}

/** the next chapter to play, or null when the campaign is over */
export function nextChapter(state: CampaignState): string | null {
  const done = new Set(state.played.map((p) => p.chapter));
  return C.campaigns[state.campaign].chapters.find((k) => !done.has(k)) ?? null;
}

const clone = (s: CampaignState): CampaignState => JSON.parse(JSON.stringify(s));

/** What the chapter writes into the campaign. decision: the Family Decision's key (The Long Ledger), or null. */
export function advance(state: CampaignState, chapter: string, result: ChapterResult, decision: string | null = null): CampaignState {
  const s = clone(state);
  const ch = C.chapters[chapter];
  let gain = result.ledger;
  if (s.campaign === "LEDGER") {
    const st = s.stickers;
    const at = (d: District) => (st[d] ??= { rebuilt: 0, scarred: 0 });
    // a woken district heals a Scar first, or is Rebuilt; a captured one is Scarred (2 stickers at most)
    for (const d of result.rebuilt) {
      const x = at(d);
      if (x.scarred) x.scarred -= 1;
      else if (x.rebuilt + x.scarred < MAX_STICKERS) x.rebuilt += 1;
    }
    for (const d of result.scarred) {
      const x = at(d);
      if (x.rebuilt + x.scarred < MAX_STICKERS) x.scarred += 1;
    }
    // the Fallen across generations: a later win with no Falls redeems one mark
    if (result.falls) s.falls += result.falls;
    else if (result.won && s.falls) {
      s.falls -= 1;
      gain += 2;
    }
    if (decision) {
      if (!ch.decision?.options.some((o) => o.key === decision)) throw new Error(`No decision ${decision} in ${chapter}`);
      s.decisions[chapter] = decision;
      if ((chapter === "FREEDOMS_LEDGER" && decision === "STAY") || (chapter === "THE_MAP" && decision === "STAY")) gain += 1;
      if (chapter === "THE_MAP" && decision === "MOVE" && st.HOUSING?.scarred) st.HOUSING.scarred -= 1;
      if (chapter === "PLANTS_CLOSE" && decision === "SELL" && st.HOUSING?.rebuilt) st.HOUSING.rebuilt -= 1;
    }
    s.stickers = Object.fromEntries(Object.entries(st).filter(([, x]) => x && (x.rebuilt || x.scarred)));
    s.rally = result.rally;
  } else {
    // Book One: flags
    const f = new Set(s.flags);
    if (chapter === "B1_CHAIN") {
      if (result.burned) f.add("TERRELL");
      if (result.won) f.add("CIVIC_ARMOR");
    }
    if (chapter === "B1_NET" && result.quit_desk) s.quit_desk = result.quit_desk;
    if (chapter === "B1_CROWN" && result.crown) f.add("CROWN_WORN");
    s.flags = [...f].sort();
  }
  s.ledger = Math.max(-10, Math.min(10, s.ledger + gain));
  for (const u of result.unlocks) if (!s.unlocks.includes(u)) s.unlocks.push(u);
  s.played.push({ chapter, won: result.won, ledger: gain, decision });
  return s;
}

/**
 * Chapter 5's choice, made before it starts: let one Rebuilt district go (remove a sticker),
 * or keep defending (district null: the Machine strikes Rebuilt districts first).
 */
export function letGo(state: CampaignState, district: District | null): CampaignState {
  const s = clone(state);
  if (district) {
    const x = s.stickers[district];
    if (x?.rebuilt) x.rebuilt -= 1;
    s.stickers = Object.fromEntries(Object.entries(s.stickers).filter(([, x]) => x && (x.rebuilt || x.scarred)));
    s.defend = false;
  } else s.defend = true;
  return s;
}
