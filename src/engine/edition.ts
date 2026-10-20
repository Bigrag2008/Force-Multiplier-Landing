/**
 * Your City editions. The rules, the deals and the Machine are the same everywhere; an edition is the
 * place they happen: what the five districts are called on your side of town, where people gather,
 * the true local history the Elder tells, and where to get real help. West Dayton is the reference
 * edition, built from the content export. game/YOUR_CITY.md is the guide to making one.
 */
import { C, DISTRICTS, type Card, type District, type HistoryCard, type PlaceKey } from "./content";

export interface EditionHistory extends HistoryCard {
  /** where the edition's makers checked the story (a book, an archive, a museum, an elder by name) */
  source?: string;
}
/** a deal from your own city or state: a local law, a local landlord's lease, a local lender's terms */
export interface LocalDeal {
  front: string;
  /** the cost (Read 1) */
  red: string;
  /** the clock (Read 2) */
  amber: string;
  /** the connection (Read 3) */
  blue: string;
  trap: boolean;
  /** which layer beats it: 1 red, 2 amber, 3 blue (traps only) */
  lever: number;
  /** the real money, for the end-of-game count */
  dollars: number;
  basis: string;
  /** the law, ordinance or public record it comes from */
  source: string;
}
export interface Resource {
  name: string;
  /** what it helps with: "free tax prep", "small loans at a fair rate", "tenant legal aid" */
  what: string;
  /** an address, a neighborhood, a phone number or a website */
  where: string;
}
export interface Edition {
  v: 1;
  id: string;
  /** "West Dayton Edition" */
  name: string;
  /** "Dayton, Ohio" */
  city: string;
  /** what the board is called in play: "the West Side" */
  area: string;
  /** who made it */
  credits?: string;
  districts: Record<District, { sub: string; flavor: string }>;
  /** names for the five gathering places; what each one does stays the same */
  places: Record<PlaceKey, { name: string; where: string; flavor: string }>;
  /** local history cards; "add" keeps the base cards too, "replace" uses yours wherever you wrote some */
  history: Partial<Record<District | "ANY", EditionHistory[]>>;
  historyMode: "add" | "replace";
  /** real help near you, shown at the end of every game and on Read your own deal */
  resources: Resource[];
  /** deals from your city or state, shuffled in with the base deck (not in endless deals or Chapter 3) */
  deals?: Partial<Record<District, LocalDeal[]>>;
  /** your own pictures of the five districts, in place of West Dayton's (small images, kept in the edition itself) */
  art?: EditionArt;
}
export interface EditionArt {
  /** each one an image as a data: URL, made small in the browser (see src/ui/art/shrink.ts) */
  districts: Partial<Record<District, string>>;
  /** who made the pictures; they said yes to them being used */
  credit: string;
}
/** the most a district picture may weigh, as text (about 120 KB of image) */
export const MAX_ART = 160_000;
const IMAGE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/;
/** only small, real images survive (a picture that isn't one is dropped, never shown) */
export function cleanArt(art: unknown): EditionArt | undefined {
  if (!art || typeof art !== "object") return undefined;
  const a = art as Partial<EditionArt>;
  const districts = Object.fromEntries(
    DISTRICTS.flatMap((d) => {
      const v = a.districts?.[d];
      return typeof v === "string" && v.length <= MAX_ART && IMAGE.test(v) ? [[d, v]] : [];
    }),
  ) as EditionArt["districts"];
  return Object.keys(districts).length ? { districts, credit: typeof a.credit === "string" ? a.credit : "" } : undefined;
}

/** an edition's local deals as playable cards */
export function localCards(ed: Edition, d: District): Card[] {
  return (ed.deals?.[d] ?? []).map((x) => ({
    front: x.front, red: x.red, amber: x.amber, blue: x.blue,
    trap: x.trap, lever: x.trap ? Math.min(3, Math.max(1, x.lever || 1)) : 0,
    dollars: Math.max(0, Math.round(x.dollars || 0)), basis: x.basis, local: true,
  }));
}

export const PLACE_KEYS = Object.keys(C.places) as PlaceKey[];

/** the reference edition: the West Side of Dayton, exactly as the base game ships */
export const WEST_DAYTON: Edition = {
  v: 1,
  id: "west-dayton",
  name: C.edition,
  city: "Dayton, Ohio",
  area: "the West Side",
  credits: "The Second Number",
  districts: Object.fromEntries(DISTRICTS.map((d) => [d, { sub: C.dayton[d].sub, flavor: C.dayton[d].flavor }])) as Edition["districts"],
  places: Object.fromEntries(PLACE_KEYS.map((k) => [k, { name: C.places[k].name, where: C.places[k].where, flavor: C.places[k].flavor }])) as Edition["places"],
  history: {},
  historyMode: "add",
  resources: [],
};

/** the five places as the game uses them: the edition's names, the base game's bonuses */
export function placesOf(ed: Edition) {
  return Object.fromEntries(PLACE_KEYS.map((k) => [k, { ...C.places[k], ...ed.places[k] }])) as typeof C.places;
}
/** the History deck for this edition */
export function historyOf(ed: Edition): Record<District | "ANY", HistoryCard[]> {
  const keys = [...DISTRICTS, "ANY"] as (District | "ANY")[];
  return Object.fromEntries(
    keys.map((k) => {
      const mine = ed.history[k] ?? [];
      const base = C.history[k];
      return [k, ed.historyMode === "replace" && mine.length ? mine : [...base, ...mine]];
    }),
  ) as Record<District | "ANY", HistoryCard[]>;
}

const LIMITS = { short: 60, long: 400 };
/** what needs fixing before an edition can be played or shared ([] = ready) */
export function checkEdition(ed: Edition): string[] {
  const out: string[] = [];
  const need = (v: string | undefined, label: string, max = LIMITS.short) => {
    if (!v || !v.trim()) out.push(`${label} is empty.`);
    else if (v.length > max) out.push(`${label} is too long (${v.length} of ${max} characters).`);
  };
  need(ed.name, "The edition's name");
  need(ed.city, "The city");
  need(ed.area, "What the board is called");
  for (const d of DISTRICTS) {
    need(ed.districts[d]?.sub, `${d}: its nickname`);
    need(ed.districts[d]?.flavor, `${d}: its description`, LIMITS.long);
  }
  for (const k of PLACE_KEYS) {
    need(ed.places[k]?.name, `${C.places[k].name} (your version): its name`);
    need(ed.places[k]?.where, `${ed.places[k]?.name || k}: where it is`);
  }
  for (const [d, cards] of Object.entries(ed.history))
    for (const [i, h] of (cards ?? []).entries()) {
      const label = `History ${d} #${i + 1}`;
      need(h.title, `${label}: title`);
      need(h.story, `${label}: story`, 700);
      need(h.lesson, `${label}: lesson`, LIMITS.long);
      if (!h.source?.trim()) out.push(`${label}: say where you checked it (source). History cards have to be true.`);
    }
  for (const [d, deals] of Object.entries(ed.deals ?? {}))
    for (const [i, x] of (deals ?? []).entries()) {
      const label = `Local deal ${d} #${i + 1}`;
      need(x.front, `${label}: what it says`, 120);
      need(x.red, `${label}: the cost (red)`, 200);
      need(x.amber, `${label}: the clock (amber)`, 200);
      need(x.blue, `${label}: the connection (blue)`, 200);
      if (!x.source?.trim()) out.push(`${label}: name the law, ordinance or record it comes from (source).`);
      if (x.trap && ![1, 2, 3].includes(x.lever)) out.push(`${label}: pick which layer beats it (red, amber or blue).`);
    }
  if (ed.art && Object.keys(ed.art.districts).length && !ed.art.credit?.trim())
    out.push("Pictures: say who made them (and that they said yes to them being used here).");
  for (const [i, r] of ed.resources.entries()) {
    need(r.name, `Resource #${i + 1}: name`);
    need(r.what, `Resource #${i + 1}: what it helps with`);
  }
  return out;
}

/** a fresh edition to fill in, starting from West Dayton's shape */
export function blankEdition(): Edition {
  const id = `ed-${Date.now().toString(36)}`;
  return {
    ...structuredClone(WEST_DAYTON),
    id,
    name: "",
    city: "",
    area: "",
    credits: "",
    districts: Object.fromEntries(DISTRICTS.map((d) => [d, { sub: "", flavor: "" }])) as Edition["districts"],
    places: Object.fromEntries(PLACE_KEYS.map((k) => [k, { name: "", where: "", flavor: "" }])) as Edition["places"],
    deals: {},
  };
}

// ---- sharing: "SNE1." + base64url JSON (the same shape as a game's result code) ----
const PREFIX = "SNE1.";
/** a share code: everything but the pictures, so it stays short enough to paste (pictures travel in the .json file) */
export function encodeEdition(ed: Edition): string {
  const { art: _art, ...rest } = ed; // eslint-disable-line @typescript-eslint/no-unused-vars
  const bytes = new TextEncoder().encode(JSON.stringify(rest));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return PREFIX + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/** an edition from a share code or a downloaded .json file's text; null if it isn't one */
export function readEdition(text: string): Edition | null {
  try {
    const t = text.trim();
    let json = t;
    if (t.startsWith(PREFIX)) {
      const b64 = t.slice(PREFIX.length).replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
      json = new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    }
    const ed = JSON.parse(json) as Edition;
    if (ed?.v !== 1 || typeof ed.id !== "string" || !ed.districts || !ed.places) return null;
    // tolerate older or hand-made files: fill anything missing from the blank shape
    const base = blankEdition();
    return {
      ...base,
      ...ed,
      districts: { ...base.districts, ...ed.districts },
      places: { ...base.places, ...ed.places },
      history: ed.history ?? {},
      historyMode: ed.historyMode === "replace" ? "replace" : "add",
      resources: Array.isArray(ed.resources) ? ed.resources : [],
      deals: ed.deals && typeof ed.deals === "object" ? ed.deals : {},
      art: cleanArt(ed.art),
    };
  } catch {
    return null;
  }
}

// ---- kept on this device ----
const KEY = "sn-editions";
/** the edition this device played last, so setup (and Read your own deal) picks it next time */
export const LAST_EDITION = "sn-edition-last";
export function loadEditions(): Edition[] {
  try {
    const list = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.map((x) => readEdition(JSON.stringify(x))).filter((x): x is Edition => !!x) : [];
  } catch {
    return [];
  }
}
export function saveEditions(list: Edition[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // no storage: the edition still plays this session
  }
}
