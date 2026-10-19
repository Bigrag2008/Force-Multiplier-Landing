"use client";
import { useCallback, useReducer, useState } from "react";
import type { Move } from "../game/moves";
import { saveGame, type SaveFile } from "../game/save";
import { Session, type SessionConfig } from "../game/session";
import { diff, snap, type Delta } from "./changes";

export type Play = (m: Move) => void;
export type Local = (fn: (s: Session) => void) => void;

/** a new game, or a saved one to rebuild */
export type GameStart = { config: SessionConfig } | { save: SaveFile };

export function startSession(start: GameStart) {
  if ("config" in start) return new Session(start.config);
  const s = Session.replay(start.save.config, start.save.moves);
  s.coach = start.save.coach;
  s.seenLessons = new Set(start.save.seenLessons);
  return s;
}

/**
 * Holds the game. `play` makes a move (and saves the game); `local` changes this device's own
 * settings (the Coach, lessons read). `changes` is what the last move did, so the board can show it.
 * `send`, when given, takes over making moves (online play: the host decides what happens).
 */
export function useSession(start: GameStart, send?: (m: Move) => void) {
  const [session] = useState(() => startSession(start));
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const [changes, setChanges] = useState<{ id: number; delta: Delta } | null>(null);
  /** apply a move here: from this device, or one the host sent */
  const apply = useCallback(
    (m: Move) => {
      const before = snap(session.g);
      if (!session.apply(m)) return false;
      const delta = diff(before, snap(session.g));
      if (delta) setChanges((c) => ({ id: (c?.id ?? 0) + 1, delta }));
      saveGame(session);
      bump();
      return true;
    },
    [session],
  );
  const play: Play = useCallback((m) => (send ? send(m) : void apply(m)), [send, apply]);
  const local: Local = useCallback(
    (fn) => {
      fn(session);
      saveGame(session);
      bump();
    },
    [session],
  );
  return { session, play, local, apply, version, changes };
}
