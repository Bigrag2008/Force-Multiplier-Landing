/**
 * The family a campaign follows, kept on this device: one for The Long Ledger and one for Book One.
 * Each holds the campaign state (src/engine/campaign.ts) and, so a reload can't count a chapter twice,
 * the last game it wrote down.
 */
import { advance, newState } from "../engine/campaign";
import type { District } from "../engine/content";
import type { CampaignState, ChapterResult } from "../engine/engine";
import { t, tDistrictTitle } from "../i18n";

export type CampaignKey = "LEDGER" | "BOOK_ONE";
export interface Family {
  state: CampaignState;
  /** the last game written into the family */
  lastId: string | null;
}
const KEY = "sn-family";

function all(): Partial<Record<CampaignKey, Family>> {
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") ?? {};
  } catch {
    return {};
  }
}
function save(m: Partial<Record<CampaignKey, Family>>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // no storage: the family lasts this visit
  }
}

export function loadFamily(c: CampaignKey): Family {
  return all()[c] ?? { state: newState(c), lastId: null };
}
export function forgetFamily(c: CampaignKey) {
  const m = all();
  delete m[c];
  save(m);
}

/** write a finished chapter (once) into the family, with the decision the table made */
export function recordChapter(c: CampaignKey, gameId: string, chapter: string, result: ChapterResult, decision: string | null): Family {
  const m = all();
  const prev = m[c] ?? { state: newState(c), lastId: null };
  if (prev.lastId === gameId) return prev;
  const next = { state: advance(prev.state, chapter, result, decision), lastId: gameId };
  m[c] = next;
  save(m);
  return next;
}

/** "Housing Rebuilt ×1, Labor Scarred ×1" */
export function describeStickers(st: CampaignState): string {
  const parts = Object.entries(st.stickers).map(
    ([d, x]) => tDistrictTitle(d as District) + (x?.rebuilt ? t(" Rebuilt ×{n}", { n: x.rebuilt }) : "") + (x?.scarred ? t(" Scarred ×{n}", { n: x.scarred }) : ""),
  );
  return parts.length ? parts.join(", ") : t("no stickers yet");
}

export const FLAG_WORDS: Record<string, string> = {
  TERRELL: "Terrell (the block starts Chapter 3 a Trust down)",
  CIVIC_ARMOR: "Civic Armor (every Teach comes with cover)",
  CROWN_WORN: "Someone wore the Crown (an extra strike in Chapter 4's first round)",
};
