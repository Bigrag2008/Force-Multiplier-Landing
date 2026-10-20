/**
 * Hearing from players: a few taps at the end of a game, and the game's own facts (never a name). Answers go to
 * the Google Sheet the site's owner connects (game/FEEDBACK.md: NEXT_PUBLIC_FEEDBACK_URL, set when the site is
 * built). Until one is connected, nothing leaves the device: answers are kept here and can be copied out.
 */
import { getLang } from "../i18n";
import type { Session } from "./session";

export const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL ?? "";
const KEY = "sn-feedback";
const MAX_KEPT = 50;
export const NOTE_MAX = 280;

/** the moments players most often trip on, offered as one-tap chips */
export const CONFUSING = {
  glasses: "Reading the card (the glasses)",
  choices: "TAKE / WALK / NEGOTIATE",
  lever: "The lever",
  machine: "What the Machine did",
  underworld: "The Underworld and threads",
  teaching: "Teaching",
  nothing: "Nothing, it made sense",
} as const;
export type ConfusingKey = keyof typeof CONFUSING;
export const FUN = [1, 2, 3, 4] as const; // 😐 🙂 😄 🔥
export type Again = "yes" | "maybe" | "no";

/** what the game says about itself: no names, no edition text a player typed */
export interface GameFacts {
  mode: string;
  chapter: string | null;
  players: number;
  won: boolean;
  rounds: number;
  lang: string;
  coach: boolean;
  /** the English front of the deal that fooled this table most, if any */
  fooledBy: string | null;
  /** "west-dayton", or "your-city" for any home-made edition (its name stays private) */
  edition: string;
}
export interface Feedback {
  v: 1;
  /** one per game: answering twice replaces the first answer, never counts twice */
  id: string;
  at: number;
  fun: number;
  confusing: ConfusingKey[];
  again: Again;
  note: string;
  facts: GameFacts;
  sent?: boolean;
}

export function factsOf(s: Session): GameFacts {
  const g = s.g;
  const fooled: Record<string, number> = {};
  for (const x of g.signed) if (x.out === "taken" || x.out === "played" || x.out === "conned") fooled[x.front] = (fooled[x.front] ?? 0) + 1;
  const top = Object.entries(fooled).sort((a, b) => b[1] - a[1])[0];
  return {
    mode: s.config.mode,
    chapter: g.chapter?.key ?? null,
    players: g.blk().length,
    won: g.result === "BLOCK_WIN",
    rounds: g.round,
    lang: getLang(),
    coach: !!s.config.coach,
    fooledBy: top ? top[0].slice(0, 120) : null,
    edition: g.ed.id === "west-dayton" ? "west-dayton" : "your-city",
  };
}

/** a feedback answer, cleaned: only the known chips, a short note, numbers in range */
export function makeFeedback(id: string, fun: number, confusing: string[], again: string, note: string, facts: GameFacts): Feedback {
  return {
    v: 1, id, at: Date.now(),
    fun: Math.max(1, Math.min(4, Math.round(fun) || 1)),
    confusing: [...new Set(confusing)].filter((k): k is ConfusingKey => k in CONFUSING),
    again: (["yes", "maybe", "no"] as const).includes(again as Again) ? (again as Again) : "maybe",
    note: note.replace(/\s+/g, " ").trim().slice(0, NOTE_MAX),
    facts,
  };
}

export function loadFeedback(): Feedback[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function keep(list: Feedback[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_KEPT)));
  } catch {
    // no storage: the answer lasts this visit
  }
}

/**
 * Keep the answer on this device and, if a Sheet is connected, send it. "sent" means it left the device
 * (the Sheet's script can't answer across sites, so arrival isn't confirmed); "kept" means no Sheet is connected.
 */
export async function submitFeedback(fb: Feedback, url = FEEDBACK_URL): Promise<"sent" | "kept" | "failed"> {
  const list = loadFeedback().filter((x) => x.id !== fb.id);
  if (!url) {
    keep([...list, fb]);
    return "kept";
  }
  try {
    // text/plain and no-cors: a "simple" request, so Google's web app accepts it without a preflight
    await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(fb) });
    keep([...list, { ...fb, sent: true }]);
    return "sent";
  } catch {
    keep([...list, fb]);
    return "failed";
  }
}

/** every answer kept on this device, as text a tester can paste into an email or a sheet */
export function feedbackText(list = loadFeedback()): string {
  return list.map((x) => JSON.stringify(x)).join("\n");
}
