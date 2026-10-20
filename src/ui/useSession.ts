"use client";
import { useCallback, useReducer, useState } from "react";
import type { Move } from "../game/moves";
import { saveGame, type SaveFile } from "../game/save";
import { Session, type SessionConfig } from "../game/session";
import { diff, snap, type Delta } from "./changes";

const EMPTY: Delta = { districts: {}, players: {}, threads: 0 };

export type Play = (m: Move) => void;
export type Local = (fn: (s: Session) => void) => void;

/** a new game, a saved one to rebuild, or (online) the host's game so far */
export type GameStart = { config: SessionConfig } | { save: SaveFile } | { config: SessionConfig; moves: Move[] };

export function startSession(start: GameStart) {
  if ("moves" in start) return Session.replay(start.config, start.moves);
  if ("config" in start) return new Session(start.config);
  const s = Session.replay(start.save.config, start.save.moves);
  s.coach = start.save.coach;
  s.seenLessons = new Set(start.save.seenLessons);
  s.room = start.save.room;
  return s;
}

/**
 * Holds the game. `play` makes a move (and saves the game); `local` changes this device's own
 * settings (the Coach, lessons read). `changes` is what the last move did, so the board can show it.
 * Online: a phone `send`s its moves to the host instead of making them; the host's `onApplied`
 * passes each move on to the phones. Only the host's device keeps a save (`autosave`).
 */
export function useSession(start: GameStart, opts: { send?: (m: Move) => void; onApplied?: (m: Move) => void; autosave?: boolean } = {}) {
  const { send, onApplied, autosave = true } = opts;
  const [session] = useState(() => startSession(start));
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const [changes, setChanges] = useState<{ id: number; delta: Delta; lines: string[] } | null>(null);
  /** apply a move here: from this device, or one the host sent */
  const apply = useCallback(
    (m: Move) => {
      const before = snap(session.g);
      const at = session.g.log.length;
      if (!session.apply(m)) return false;
      const delta = diff(before, snap(session.g));
      // the log lines this move wrote: what happened, so the screen can make it land (impact.ts)
      const lines = session.g.log.slice(at);
      if (delta || lines.length) setChanges((c) => ({ id: (c?.id ?? 0) + 1, delta: delta ?? EMPTY, lines }));
      if (autosave) saveGame(session);
      bump();
      return true;
    },
    [session, autosave],
  );
  const play: Play = useCallback(
    (m) => {
      if (send) send(m);
      else if (apply(m)) onApplied?.(m);
    },
    [send, apply, onApplied],
  );
  const local: Local = useCallback(
    (fn) => {
      fn(session);
      if (autosave) saveGame(session);
      bump();
    },
    [session, autosave],
  );
  return { session, play, local, apply, version, changes };
}
