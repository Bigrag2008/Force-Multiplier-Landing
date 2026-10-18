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
}

export const C = raw as unknown as Content;
export const DISTRICTS = C.districts;
export const K = C.constants;
