"use client";
import { useCallback, useReducer, useState } from "react";
import { Session, type SessionConfig } from "../game/session";

/** Holds a mutable game Session and re-renders after every change made through `run`. */
export function useSession(config: SessionConfig) {
  const [session] = useState(() => new Session(config));
  const [version, bump] = useReducer((x: number) => x + 1, 0);
  const run = useCallback(
    (fn: (s: Session) => void) => {
      fn(session);
      bump();
    },
    [session],
  );
  return { session, run, version };
}
