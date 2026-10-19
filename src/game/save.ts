/**
 * One saved game per device, in the browser's storage: the config and the moves (see moves.ts),
 * plus this device's Coach settings. Written after every move; cleared when the game ends.
 * Storage can be missing (private windows, blocked site data): then saving is quietly skipped.
 */
import type { Move } from "./moves";
import type { Session, SessionConfig } from "./session";

const KEY = "sn-save";

export interface SaveFile {
  v: 1;
  config: SessionConfig;
  moves: Move[];
  coach: boolean;
  seenLessons: string[];
  savedAt: number;
  /** for the "continue" card: who's playing and where they are */
  label: { mode: string; names: string[]; round: number };
}

export function saveGame(s: Session) {
  try {
    if (s.phase === "over") return window.localStorage.removeItem(KEY);
    const file: SaveFile = {
      v: 1,
      config: s.config,
      moves: s.moves,
      coach: s.coach,
      seenLessons: [...s.seenLessons],
      savedAt: Date.now(),
      label: {
        mode: s.g.overlord ? "Overlord" : s.g.chapter ? `Campaign: Chapter ${s.g.chapter.number}` : s.g.scenario,
        names: s.g.players.filter((p) => p.role !== "Overlord").map((p) => p.name),
        round: s.g.round,
      },
    };
    window.localStorage.setItem(KEY, JSON.stringify(file));
  } catch {
    // no storage: the game still plays, it just can't be continued later
  }
}

export function loadGame(): SaveFile | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const file = JSON.parse(raw) as SaveFile;
    return file?.v === 1 && Array.isArray(file.moves) ? file : null;
  } catch {
    return null;
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
}
