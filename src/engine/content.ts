/**
 * Typed access to the game content exported from the Python source of truth
 * (scripts/export_content.py → src/content/content.json). Never edit the JSON by hand.
 */
import raw from "../content/content.json";

export type District = "LENDING" | "HOUSING" | "LABOR" | "HEALTH" | "EDUCATION";
export type PlaceKey = "BARBERSHOP" | "CHURCH" | "ADVENTURE" | "MARKET" | "KITCHEN";
export type Choice = "TAKE" | "WALK" | "NEGOTIATE";

export interface Card {
  front: string;
  red: string;
  amber: string;
  blue: string;
  trap: boolean;
  lever: number;
  /** the fine-print die, when it set the lever */
  die?: number;
  /** endless deals: the math behind the red layer, and its answer (the second number) */
  ask?: string;
  answer?: number;
  gen?: boolean;
}
/** a deal with blanks (game/deal_gen.py): rolled into a fresh Card for endless deals */
export interface DealTemplate {
  front: string;
  red: string;
  amber: string;
  blue: string;
  ask: string;
  calc: "mul" | "mul_add" | "mul_sub" | "add" | "apr";
  trap?: boolean;
  lever?: number;
  mul?: [string, string];
  [slot: string]: unknown;
}
export interface Pattern {
  combo: District[];
  name: string;
  lesson: string;
}
export interface HistoryCard {
  title: string;
  year: string;
  place: string;
  story: string;
  lesson: string;
}
export interface Place {
  name: string;
  where: string;
  bonus: string;
  flavor: string;
}
export interface Chapter {
  number: number;
  title: string;
  era: string;
  intro: string;
  pressure: Partial<Record<District, number>>;
  twist: string;
  owner: string;
  face: string;
  face_text: string;
  decks: Partial<Record<District, Card[]>>;
  league?: { name: string; text: string };
  unlocks_always: string[];
  unlocks_if_league_won: string[];
  decision: string;
}
interface Constants {
  WAKE: number;
  CAPTURE: number;
  FLIP: number;
  GRIP: number;
  LOSE_CAPTURED: number;
  UNDERWORLD_AT: number;
  THREADS_TO_WIN: number;
  TAKE_CORRUPT: number;
  NEG_COST: number;
  START_TRUST: number;
  MAX_TRUST: number;
  MAX_ROUNDS: number;
  SOUSOU_HAND: number;
  LEAGUE_PUSH: District[];
  ACTIONS: Record<string, number>;
  MACHINE_HITS: Record<string, number>;
  OVERLORD_MOVES: Record<string, number>;
  BP_DISTRICTS: District[];
  BP_ROUNDS: number;
  BP_WAKE_TO_WIN: number;
  BP_TAKE: number;
  BP_SIT_OUT: number;
  BP_ACTIONS: Record<string, number>;
  BP_HITS: Record<string, number>;
  FINE_PRINT_DIE: Record<string, number>;
}
interface Content {
  edition: string;
  districts: District[];
  districtColors: Record<District, string>;
  dayton: Record<District, { sub: string; flavor: string }>;
  deck: Record<District, Card[]>;
  roles: Record<string, string>;
  patterns: Pattern[];
  owners: Record<string, string>;
  scenarios: Record<string, string>;
  history: Record<District | "ANY", HistoryCard[]>;
  places: Record<PlaceKey, Place>;
  chapters: Record<string, Chapter>;
  roster: { name: string; role: string }[];
  constants: Constants;
  dealTemplates: Record<District, DealTemplate[]>;
  slotOrder: string[];
}

export const C = raw as unknown as Content;
export const DISTRICTS = C.districts;
export const K = C.constants;
