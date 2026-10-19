/**
 * Online play: one device hosts the game; everyone else joins from their phone and takes a seat.
 * The host is the referee: phones send moves, the host checks and makes them, then sends every
 * phone the same move, and each phone replays it (a game is its seed plus its moves: moves.ts).
 */
import type { Move } from "../game/moves";
import type { Session, SessionConfig } from "../game/session";

/** to the host */
export type ToHost = { type: "claim"; seat: string } | { type: "move"; m: Move } | { type: "sync" } | { type: "ping" };

/** a phone checks in this often; the host frees the seat of a phone silent for PHONE_GONE_MS */
export const PING_MS = 2000;
export const PHONE_GONE_MS = 7000;

/** to a phone */
export type ToGuest =
  | { type: "state"; config: SessionConfig; moves: Move[]; seats: SeatMap; you: string | null }
  | { type: "move"; m: Move; n: number }
  | { type: "seats"; seats: SeatMap; you: string | null }
  | { type: "refused"; reason: string }
  | { type: "ping" };

/** each seat (a player's name): played on the host device, or taken by a phone */
export type SeatMap = Record<string, "host" | "phone">;

export const ROOM_PREFIX = "the-second-number-";
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O: easy to read aloud

export function newRoomCode(random = Math.random) {
  return Array.from({ length: 4 }, () => LETTERS[Math.floor(random() * LETTERS.length)]).join("");
}
export const cleanCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);

/** every seat a person can take: the block, and the Overlord when a person plays it */
export function seatsOf(s: Session): string[] {
  return s.g.players.filter((p) => p.role !== "Overlord" || s.overlordHuman).map((p) => p.name);
}

/** the seat whose move this is, or null when anyone at the table may answer (Cookout, Sou-Sou…) */
export function seatFor(s: Session, m: Move): string | null {
  switch (m.t) {
    case "act": case "end": case "deal": case "teachCard": case "fallen":
      return s.player.name;
    case "overlord":
      return s.g.ov()?.name ?? null;
    default:
      return null;
  }
}

/** may a device controlling `mine` make this move right now? */
export function mayMove(s: Session, m: Move, mine: ReadonlySet<string>): boolean {
  if (!s.allowed(m)) return false;
  const seat = seatFor(s, m);
  return seat === null || mine.has(seat);
}

/** whose turn the table is waiting on right now (null: anyone may answer) */
export function waitingOn(s: Session): string | null {
  if (s.phase === "turn" || s.phase === "fallen") return s.player.name;
  if (s.phase === "overlord") return s.g.ov()?.name ?? null;
  return null;
}
