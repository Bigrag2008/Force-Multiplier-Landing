/**
 * The family a campaign follows, kept on this device: one for The Long Ledger and one for Book One.
 * Each holds the campaign state (src/engine/campaign.ts) and, so a reload can't count a chapter twice,
 * the last game it wrote down.
 */
import { advance, newState } from "../engine/campaign";
import { C, DISTRICTS, type District } from "../engine/content";
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

// ---- moving a family to another device: a code to copy and paste ----
const PREFIX = "SNF1.";

/** the family as a code anyone can paste on another device (a classroom switching laptops) */
export function encodeFamily(f: Family): string {
  const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, state: f.state }));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** a family from a pasted code, or null if it isn't one (checked field by field: a code is outside data) */
export function readFamily(text: string): Family | null {
  try {
    const raw = text.trim().replace(/\s+/g, "");
    if (!raw.startsWith(PREFIX)) return null;
    const b64 = raw.slice(PREFIX.length).replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
    const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    const st = o?.state;
    if (o?.v !== 1 || !st || (st.campaign !== "LEDGER" && st.campaign !== "BOOK_ONE")) return null;
    const chapters = new Set(C.campaigns[st.campaign].chapters);
    const num = (x: unknown, lo: number, hi: number) => (typeof x === "number" && Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x))) : 0);
    const strs = (x: unknown) => (Array.isArray(x) ? x.filter((y): y is string => typeof y === "string").slice(0, 50) : []);
    const played = (Array.isArray(st.played) ? st.played : [])
      .filter((p: { chapter?: unknown }) => typeof p?.chapter === "string" && chapters.has(p.chapter))
      .map((p: { chapter: string; won?: unknown; ledger?: unknown; decision?: unknown }) => ({
        chapter: p.chapter, won: !!p.won, ledger: num(p.ledger, -20, 20), decision: typeof p.decision === "string" ? p.decision : null,
      }));
    const stickers = Object.fromEntries(
      DISTRICTS.flatMap((d) => {
        const x = st.stickers?.[d];
        const r = num(x?.rebuilt, 0, 2);
        const sc = num(x?.scarred, 0, 2);
        return r || sc ? [[d, { rebuilt: r, scarred: sc }]] : [];
      }),
    );
    const decisions = Object.fromEntries(
      Object.entries(st.decisions ?? {}).filter(
        ([k, v]) => chapters.has(k) && typeof v === "string" && C.chapters[k].decision?.options.some((o) => o.key === v),
      ),
    ) as Record<string, string>;
    const state: CampaignState = {
      campaign: st.campaign, played, ledger: num(st.ledger, -10, 10), stickers, decisions,
      flags: strs(st.flags).filter((f) => f in FLAG_WORDS), unlocks: strs(st.unlocks), rally: !!st.rally,
      falls: num(st.falls, 0, 99), defend: st.defend !== false, quit_desk: typeof st.quit_desk === "string" ? st.quit_desk.slice(0, 40) : null,
    };
    return { state, lastId: null };
  } catch {
    return null;
  }
}

/** keep a pasted family on this device, in place of its campaign's family here */
export function adoptFamily(f: Family): Family {
  const m = all();
  m[f.state.campaign] = f;
  save(m);
  return f;
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

/** the printed envelope for a chapter (game/print_kit/build_chapter_pack.py names it the same way) */
export const envelopeOf = (ch: { campaign: string; number: number; title: string }) =>
  `/${ch.campaign === "LEDGER" ? "The_Long_Ledger" : "Book_One"}_Chapter${ch.number}_${ch.title.replace(/'/g, "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}.pdf`;
