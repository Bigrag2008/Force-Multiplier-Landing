/**
 * Languages: English (the source) and Spanish. Every English string is its own key: t("Study") shows
 * "Estudiar" in Spanish, and anything not yet translated falls back to English. The language is per
 * device (each phone at a table can choose its own) and never part of a game, so saves, online play
 * and the engine's parity with Python are untouched.
 *
 *   const lang = useLang();        // in every client component that shows words: re-renders on a switch
 *   t("{n} actions left", { n })   // {name} slots are filled after translating
 *   tCard(card)                    // a deal card's text (endless deals are refilled from Spanish templates)
 *   tLog(line)                     // a line of the game's log (src/i18n/log.ts)
 *
 * The dictionaries: src/content/es.json (card text, from game/i18n/, exported by `npm run content`)
 * and src/i18n/es/*.ts (the website's own words).
 */
import { useSyncExternalStore } from "react";
import content from "../content/es.json";
import { C, type Card, type District } from "../engine/content";
import { ES_UI } from "./es";

export type Lang = "en" | "es";
export const LANGS: { id: Lang; name: string }[] = [
  { id: "en", name: "English" },
  { id: "es", name: "Español" },
];
const KEY = "sn-lang";
const ES: Record<string, string> = { ...(content as Record<string, string>), ...ES_UI };

let current: Lang = "en";
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return current;
}
export function setLang(l: Lang) {
  if (l === current) return;
  current = l;
  try {
    window.localStorage.setItem(KEY, l);
  } catch {
    // no storage: this visit only
  }
  if (typeof document !== "undefined") document.documentElement.lang = l;
  for (const f of listeners) f();
}
/** on the client, once: ?lang=es in the address wins, then this device's choice */
export function initLang() {
  if (typeof window === "undefined") return;
  let l: string | null = new URLSearchParams(window.location.search).get("lang");
  try {
    l ??= window.localStorage.getItem(KEY);
  } catch {
    // no storage
  }
  if (l === "es" || l === "en") setLang(l);
}
function subscribe(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}
/** the current language; the component re-renders when it changes (the server always renders English) */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, getLang, () => "en");
}

/** a string in the current language, with {slots} filled */
export function t(en: string, vars?: Record<string, string | number>): string {
  const s = current === "es" ? (ES[en] ?? en) : en;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;
}
/** true when a string has a Spanish version (tests and the translators' report use it) */
export function hasEs(en: string) {
  return en in ES;
}

const DISTRICT_ES: Record<District, string> = { LENDING: "PRÉSTAMOS", HOUSING: "VIVIENDA", LABOR: "TRABAJO", HEALTH: "SALUD", EDUCATION: "EDUCACIÓN" };
/** a district's name as the board shows it: "LENDING" / "PRÉSTAMOS" */
export function tDistrict(d: District): string {
  return current === "es" ? DISTRICT_ES[d] : d;
}
/** "Lending" / "Préstamos" */
export function tDistrictTitle(d: District): string {
  const s = tDistrict(d);
  return s.charAt(0) + s.slice(1).toLowerCase();
}
export const DISTRICT_NAMES_ES = DISTRICT_ES;

/** a deal card in the current language: printed cards by their text, endless deals refilled from their template */
export function tCard<T extends Card>(card: T): T {
  if (current === "en") return card;
  const tpl = card.tpl;
  if (tpl) {
    const src = C.dealTemplates[tpl.d]?.[tpl.i];
    if (src) {
      const v = Object.fromEntries(Object.entries(tpl.v).map(([k, x]) => [k, typeof x === "string" ? t(x) : x]));
      const fill = (s: string) => t(s).replace(/\{(\w+)\}/g, (_, k: string) => (typeof v[k] === "number" ? (v[k] as number).toLocaleString("en-US") : String(v[k])));
      return { ...card, front: fill(src.front), red: fill(src.red), amber: fill(src.amber), blue: fill(src.blue), ask: fill(src.ask), basis: t(card.basis ?? "") };
    }
  }
  return { ...card, front: t(card.front), red: t(card.red), amber: t(card.amber), blue: t(card.blue), ...(card.basis ? { basis: t(card.basis) } : {}) };
}
