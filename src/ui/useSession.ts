"use client";
import { useCallback, useReducer, useState } from "react";
import { Session, type SessionConfig } from "../game/session";
import { diff, snap, type Delta } from "./changes";

/**
 * Holds a mutable game Session and re-renders after every change made through `run`.
 * `changes` is what the last step that changed anything did, so the board can show it.
 */
export function useSession(config: SessionConfig) {
  const [session] = useState(() => new Session(config));
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const [changes, setChanges] = useState<{ id: number; delta: Delta } | null>(null);
  const run = useCallback(
    (fn: (s: Session) => void) => {
      const before = snap(session.g);
      fn(session);
      const delta = diff(before, snap(session.g));
      if (delta) setChanges((c) => ({ id: (c?.id ?? 0) + 1, delta }));
      bump();
    },
    [session],
  );
  return { session, run, version, changes };
}
