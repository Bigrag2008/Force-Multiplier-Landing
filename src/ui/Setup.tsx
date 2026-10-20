"use client";
import { useState } from "react";
import { C } from "../engine/content";
import type { Mode, SessionConfig } from "../game/session";
import { RolePortrait } from "./art/RolePortrait";

const ROLES = Object.keys(C.roles);
const DEFAULT_NAMES = C.roster.map((r) => r.name);

export function Setup({ onStart }: { onStart: (c: SessionConfig, online: boolean) => void }) {
  const [mode, setMode] = useState<Mode>("coop");
  const [count, setCount] = useState(4);
  const [names, setNames] = useState<string[]>(DEFAULT_NAMES);
  const [roles, setRoles] = useState<string[]>(C.roster.map((r) => r.role));
  const [scenario, setScenario] = useState("A Quiet Year");
  const [overlordHuman, setOverlordHuman] = useState(false);
  const [coach, setCoach] = useState(true);
  const [online, setOnline] = useState(false);
  const [rules, setRules] = useState({ finePrint: false, terrell: false, endless: false, math: false, clocks: true });
  const party = mode === "party";
  const rule = (k: keyof typeof rules) => (e: { target: { checked: boolean } }) => setRules({ ...rules, [k]: e.target.checked });
  const field = "rounded-lg border border-white/20 bg-white/10 px-3 py-2";
  const dupRoles = !party && new Set(roles.slice(0, count)).size < count;
  const finalNames = names.slice(0, count).map((n, i) => n.trim() || DEFAULT_NAMES[i]);
  // seats are known by name (online, a phone claims a name), and "The Owner" is the Overlord's
  const dupNames = new Set(finalNames.map((n) => n.toLowerCase())).size < count || finalNames.some((n) => n.toLowerCase() === "the owner");

  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-gold/40 bg-black/25 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (dupRoles || dupNames) return;
        onStart({
          mode,
          roster: Array.from({ length: count }, (_, i) => ({ name: names[i].trim() || DEFAULT_NAMES[i], role: party ? "Neighbor" : roles[i] })),
          scenario: mode === "coop" ? (scenario === "random" ? undefined : scenario) : undefined,
          overlordHuman: mode === "overlord" && overlordHuman,
          coach,
          finePrint: !party && rules.finePrint,
          terrell: !party && rules.terrell,
          endless: rules.endless,
          math: rules.endless && rules.math,
          clocks: rules.clocks,
        }, online);
      }}
    >
      <fieldset>
        <legend className="text-lg font-black text-gold">How are you playing?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ["party", "Block Party", "Start here: 3 districts, 8 rounds, about 25 minutes. No roles, no Owner."],
              ["coop", "Co-op", "The full game: the block against the Machine."],
              ["overlord", "Overlord", "One player is the Machine (or the computer is), with 3 counterfeit deals up its sleeve."],
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
          <div key={i} className={`grid items-center gap-2 ${party ? "grid-cols-1" : "grid-cols-[auto_1fr_1fr]"}`}>
            {!party && <RolePortrait role={roles[i]} size={34} />}
            <input aria-label={`Player ${i + 1} name`} className={field} value={names[i]} onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} />
            {!party && <select aria-label={`Player ${i + 1} role`} className={field} value={roles[i]} onChange={(e) => setRoles(roles.map((r, j) => (j === i ? e.target.value : r)))}>
              {ROLES.map((r) => (
                <option key={r} value={r} className="text-ink">The {r}</option>
              ))}
            </select>}
          </div>
        ))}
        {dupRoles && <p className="text-sm text-[#ff9b9b]">Each player needs a different role.</p>}
        {dupNames && <p className="text-sm text-[#ff9b9b]">Each player needs a different name (and &ldquo;The Owner&rdquo; is taken).</p>}
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
          <p className="text-xs text-program/70">{scenario !== "random" ? C.scenarios[scenario] : "A random scenario."} Start with The Audit or A Quiet Year.</p>
        </div>
      )}
      {mode === "overlord" && (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={overlordHuman} onChange={(e) => setOverlordHuman(e.target.checked)} />
          A person plays the Overlord (otherwise the computer does)
        </label>
      )}

      <fieldset className="space-y-2 rounded-xl border border-white/15 p-3">
        <legend className="px-1 font-bold">House rules {party ? "" : "(for tables that know the game)"}</legend>
        {!party && (
          <>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={rules.finePrint} onChange={rule("finePrint")} />
              <span><b>🎲 Fine-print dice</b><span className="block text-xs text-program/70">Each trap&apos;s lever is rolled when it&apos;s drawn (1–3 red, 4–5 amber, 6 blue), so nobody can learn the deck by heart.</span></span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={rules.terrell} onChange={rule("terrell")} />
              <span><b>The Terrell rule</b><span className="block text-xs text-program/70">Teaching gives Read, not cover. Confront a trap in a district you were taught before the block has your back (any Commons, or the Veteran&apos;s lesson) and it backfires: +1 Squeeze.</span></span>
            </label>
          </>
        )}
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={rules.clocks} onChange={rule("clocks")} />
          <span><b>⏱ Sign-now clocks</b><span className="block text-xs text-program/70">Some deals push you to sign before you can think: a clock counts down while you decide. The deadline is always fake, and Read 2 shows you that. On by default.</span></span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1" checked={rules.endless} onChange={rule("endless")} />
          <span><b>♾ Endless deals</b><span className="block text-xs text-program/70">Deals are rolled fresh from templates: the numbers change every draw.</span></span>
        </label>
        {rules.endless && (
          <label className="ml-6 flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={rules.math} onChange={rule("math")} />
            <span><b>✏️ Work it out</b><span className="block text-xs text-program/70">The math variant: at Read 1 you work out the second number yourself before the red layer opens. Good for classrooms.</span></span>
          </label>
        )}
      </fieldset>

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={coach} onChange={(e) => setCoach(e.target.checked)} />
        <span>
          <b>Coach me as we play</b>
          <span className="block text-xs text-program/70">The Coach glows on the move it would make, says why, and explains each rule the first time it comes up. Turn it off any time.</span>
        </span>
      </label>

      <label className="flex items-start gap-2">
        <input type="checkbox" className="mt-1" checked={online} onChange={(e) => setOnline(e.target.checked)} />
        <span>
          <b>📱 Play on everyone&apos;s phones</b>
          <span className="block text-xs text-program/70">
            This device becomes the table and opens a room with a code. Everyone joins from their phone (Join a game on the home page) and plays their own seat; deal cards stay private on the reader&apos;s phone. Any seat nobody takes is played here.
          </span>
        </span>
      </label>

      <button type="submit" disabled={dupRoles || dupNames} className="w-full rounded-xl bg-gold px-4 py-3 text-lg font-black text-night disabled:opacity-50">
        Start the game
      </button>
      <p className="text-center text-xs text-program/60">{online ? "This device is the table; phones join with the room code." : "One device, passed around the table. Everyone can see the board."}</p>
    </form>
  );
}
