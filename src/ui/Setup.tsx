"use client";
import { useState } from "react";
import { C } from "../engine/content";
import type { Mode, SessionConfig } from "../game/session";
import { say } from "../game/words";

const ROLES = Object.keys(C.roles);
const DEFAULT_NAMES = C.roster.map((r) => r.name);

export function Setup({ onStart }: { onStart: (c: SessionConfig) => void }) {
  const [mode, setMode] = useState<Mode>("coop");
  const [count, setCount] = useState(4);
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [roles, setRoles] = useState<string[]>(C.roster.map((r) => r.role));
  const [scenario, setScenario] = useState("A Quiet Year");
  const [overlordHuman, setOverlordHuman] = useState(false);
  const [coach, setCoach] = useState(true);
  const field = "rounded-lg border border-white/20 bg-white/10 px-3 py-2";
  const dupRoles = new Set(roles.slice(0, count)).size < count;

  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-gold/40 bg-black/25 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (dupRoles) return;
        onStart({
          mode,
          roster: Array.from({ length: count }, (_, i) => ({ name: names[i].trim() || DEFAULT_NAMES[i], role: roles[i] })),
          scenario: mode === "coop" ? (scenario === "random" ? undefined : scenario) : undefined,
          overlordHuman: mode === "overlord" && overlordHuman,
          coach,
        });
      }}
    >
      <fieldset>
        <legend className="text-lg font-black text-gold">How are you playing?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(
            [
              ["coop", "Co-op", "The block against the Machine."],
              ["overlord", "Overlord", "One player is the Machine (or the computer is)."],
              ["chapter", "Campaign", "The Long Ledger, Chapter 3: The Map (1930s–1960s)."],
            ] as [Mode, string, string][]
          ).map(([m, t, d]) => (
            <label key={m} className={`cursor-pointer rounded-xl border p-3 ${mode === m ? "border-gold bg-gold/10" : "border-white/20"}`}>
              <input type="radio" name="mode" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
              <span className="block font-black">{t}</span>
              <span className="block text-xs text-program/75">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="count" className="font-bold">Players on the block</label>
        <select id="count" className={field} value={count} onChange={(e) => setCount(+e.target.value)}>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n} className="text-ink">{n}</option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-bold">The crew</legend>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <input aria-label={`Player ${i + 1} name`} className={field} value={names[i]} onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} />
            <select aria-label={`Player ${i + 1} role`} className={field} value={roles[i]} onChange={(e) => setRoles(roles.map((r, j) => (j === i ? e.target.value : r)))}>
              {ROLES.map((r) => (
                <option key={r} value={r} className="text-ink">The {r}</option>
              ))}
            </select>
          </div>
        ))}
        {dupRoles && <p className="text-sm text-[#ff9b9b]">Each player needs a different role.</p>}
      </fieldset>

      {mode === "coop" && (
        <div className="space-y-1">
          <label htmlFor="scenario" className="font-bold">Scenario</label>
          <select id="scenario" className={`${field} w-full`} value={scenario} onChange={(e) => setScenario(e.target.value)}>
            <option value="random" className="text-ink">Surprise me</option>
            {Object.keys(C.scenarios).map((s) => (
              <option key={s} value={s} className="text-ink">{s}</option>
            ))}
          </select>
          <p className="text-xs text-program/70">{scenario !== "random" ? say(C.scenarios[scenario]) : "A random scenario."} Start with The Audit or A Quiet Year.</p>
        </div>
      )}
      {mode === "overlord" && (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={overlordHuman} onChange={(e) => setOverlordHuman(e.target.checked)} />
          A person plays the Overlord (otherwise the computer does)
        </label>
      )}

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={coach} onChange={(e) => setCoach(e.target.checked)} />
        <span>
          <b>Coach me as we play</b>
          <span className="block text-xs text-program/70">The Coach glows on the move it would make, says why, and explains each rule the first time it comes up. Turn it off any time.</span>
        </span>
      </label>

      <button type="submit" disabled={dupRoles} className="w-full rounded-xl bg-gold px-4 py-3 text-lg font-black text-night disabled:opacity-50">
        Start the game
      </button>
      <p className="text-center text-xs text-program/60">One device, passed around the table. Everyone can see the board.</p>
    </form>
  );
}
