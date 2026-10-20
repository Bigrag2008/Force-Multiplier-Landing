"use client";
import { useEffect, useState } from "react";
import { letGo, nextChapter } from "../engine/campaign";
import { C, type District } from "../engine/content";
import { checkEdition, LAST_EDITION, loadEditions, WEST_DAYTON, type Edition } from "../engine/edition";
import { describeCarry, forgetBlock, loadBlock, type BlockMemory } from "../game/block";
import { describeStickers, FLAG_WORDS, forgetFamily, loadFamily, type CampaignKey, type Family } from "../game/family";
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
  const [rules, setRules] = useState({ finePrint: false, terrell: false, endless: false, math: false, clocks: true, partial: false, render: false });
  const [remember, setRemember] = useState(true);
  // campaigns: The Long Ledger or Book One, played as the saved family or one chapter on its own
  const [camp, setCamp] = useState<CampaignKey>("LEDGER");
  const [family, setFamily] = useState<Family | null>(null);
  const [asFamily, setAsFamily] = useState(true);
  const [pickChapter, setPickChapter] = useState("THE_MAP");
  const [release, setRelease] = useState<District | "">("");
  useEffect(() => setFamily(loadFamily(camp)), [camp]); // eslint-disable-line react-hooks/set-state-in-effect
  const famNext = family ? nextChapter(family.state) : null;
  const chapterKey = asFamily && famNext ? famNext : pickChapter;
  const chap = mode === "chapter" ? C.chapters[chapterKey] : null;
  const playMode = chap ? chap.mode : mode;
  const rebuilt = asFamily && family && chap?.defend_choice ? (Object.keys(family.state.stickers) as District[]).filter((d) => family.state.stickers[d]?.rebuilt) : [];
  const party = playMode === "party";
  // Your City editions saved on this device (only ones ready to play); ?edition=<id> picks one
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editionId, setEditionId] = useState(WEST_DAYTON.id);
  useEffect(() => {
    const ready = loadEditions().filter((e) => checkEdition(e).length === 0);
    setEditions(ready); // eslint-disable-line react-hooks/set-state-in-effect
    let pick: string | null = new URLSearchParams(window.location.search).get("edition");
    try {
      pick ??= window.localStorage.getItem(LAST_EDITION);
    } catch {
      // no storage: West Dayton
    }
    if (pick && ready.some((e) => e.id === pick)) setEditionId(pick);
  }, []);
  const edition = editions.find((e) => e.id === editionId);
  // a block that remembers (full co-op): what this edition's block carries into the next game
  const [memory, setMemory] = useState<BlockMemory | null>(null);
  useEffect(() => setMemory(loadBlock(editionId)), [editionId]); // eslint-disable-line react-hooks/set-state-in-effect
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
          overlordHuman: playMode === "overlord" && overlordHuman,
          ...(chap
            ? {
                chapter: chap.key,
                ...(asFamily && famNext && family
                  ? { family: true, campaign: chap.defend_choice ? letGo(family.state, release || null) : family.state }
                  : {}),
              }
            : {}),
          coach,
          finePrint: !party && rules.finePrint,
          terrell: !party && rules.terrell,
          endless: rules.endless,
          math: rules.endless && rules.math,
          clocks: rules.clocks,
          partial: rules.partial,
          render: rules.render,
          ...(edition ? { edition } : {}),
          ...(mode === "coop" && remember ? { remember: true, ...(memory ? { carry: memory.carry } : {}) } : {}),
        }, online);
        try {
          window.localStorage.setItem(LAST_EDITION, editionId);
        } catch {
          // no storage: nothing to remember
        }
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
              ["chapter", "Campaign", "The Long Ledger (one family, six eras) or Book One (four chapters that follow the novel)."],
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

      {mode === "chapter" && (
        <fieldset className="space-y-3 rounded-xl border border-gold/40 p-3">
          <legend className="px-1 font-bold">Which campaign?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.entries(C.campaigns) as [CampaignKey, (typeof C.campaigns)[string]][]).map(([k, c]) => (
              <label key={k} className={`cursor-pointer rounded-xl border p-3 ${camp === k ? "border-gold bg-gold/10" : "border-white/20"}`}>
                <input type="radio" name="campaign" className="sr-only" checked={camp === k} onChange={() => setCamp(k)} />
                <span className="block font-black">{c.title}</span>
                <span className="block text-xs text-program/75">{c.blurb}</span>
              </label>
            ))}
          </div>
          {family && (
            <div className="text-sm">
              <label className="flex items-start gap-2">
                <input type="radio" name="asFamily" className="mt-1" checked={asFamily && !!famNext} disabled={!famNext} onChange={() => setAsFamily(true)} />
                <span>
                  <b>{family.state.played.length ? "Continue the family" : "Start the family"}</b>
                  {famNext ? (
                    <>: Chapter {C.chapters[famNext].number}, <i>{C.chapters[famNext].title}</i> ({C.chapters[famNext].era}).</>
                  ) : (
                    <>: the family has played every chapter (Ledger {family.state.ledger > 0 ? "+" : ""}{family.state.ledger}).</>
                  )}
                  {family.state.played.length > 0 && (
                    <span className="block text-xs text-program/70">
                      {family.state.played.length} chapter{family.state.played.length === 1 ? "" : "s"} played · Ledger {family.state.ledger > 0 ? "+" : ""}
                      {family.state.ledger}
                      {camp === "LEDGER" ? ` · ${describeStickers(family.state)}` : ""}
                      {family.state.flags.length ? ` · ${family.state.flags.map((f) => FLAG_WORDS[f] ?? f).join("; ")}` : ""}
                      {family.state.rally ? " · the community rallies (+1 Trust each)" : ""}
                    </span>
                  )}
                </span>
              </label>
              <label className="mt-2 flex items-start gap-2">
                <input type="radio" name="asFamily" className="mt-1" checked={!asFamily || !famNext} onChange={() => setAsFamily(false)} />
                <span>
                  <b>Play one chapter on its own</b>
                  <span className="block text-xs text-program/70">Nothing carries in or out.</span>
                </span>
              </label>
              {(!asFamily || !famNext) && (
                <select aria-label="Chapter" className={`${field} mt-2 w-full`} value={pickChapter} onChange={(e) => setPickChapter(e.target.value)}>
                  {C.campaigns[camp].chapters.map((k) => (
                    <option key={k} value={k} className="text-ink">
                      Chapter {C.chapters[k].number}: {C.chapters[k].title} ({C.chapters[k].era})
                    </option>
                  ))}
                </select>
              )}
              {family.state.played.length > 0 && (
                <button type="button" className="mt-2 text-xs text-program/60 underline" onClick={() => { if (window.confirm("Start a new family? This one's record is forgotten.")) { forgetFamily(camp); setFamily(loadFamily(camp)); } }}>
                  Start a new family
                </button>
              )}
            </div>
          )}
          {chap && (
            <div className="rounded-lg bg-black/25 p-3 text-sm">
              <p>
                <b className="text-gold">Chapter {chap.number}: {chap.title}</b> ({chap.era}). {chap.intro}
              </p>
              <p className="mt-1"><b>The twist:</b> {chap.twist}</p>
              {rebuilt.length > 0 && (
                <label className="mt-2 block">
                  <b>Before the plants close, the family chooses:</b>
                  <select className={`${field} mt-1 w-full`} value={release} onChange={(e) => setRelease(e.target.value as District | "")}>
                    <option value="" className="text-ink">Defend what we built (the Machine strikes {rebuilt.map((d) => d.charAt(0) + d.slice(1).toLowerCase()).join(" and ")} first)</option>
                    {rebuilt.map((d) => (
                      <option key={d} value={d} className="text-ink">Let {d.charAt(0) + d.slice(1).toLowerCase()} go (remove a Rebuilt sticker)</option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </fieldset>
      )}

      <div className="space-y-1">
        <label htmlFor="edition" className="font-bold">Where you&apos;re playing</label>
        <select id="edition" className={`${field} w-full`} value={editionId} onChange={(e) => setEditionId(e.target.value)}>
          <option value={WEST_DAYTON.id} className="text-ink">{WEST_DAYTON.name} ({WEST_DAYTON.city})</option>
          {editions.map((e) => (
            <option key={e.id} value={e.id} className="text-ink">{e.name} ({e.city})</option>
          ))}
        </select>
        <p className="text-xs text-program/70">
          Make one for your own side of town: <a href="/edition" className="text-gold underline">Your City editions</a>.
        </p>
      </div>

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
      {mode === "coop" && (
        <div className="rounded-xl border border-white/15 p-3">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>
              <b>🏘 Our block remembers</b>
              <span className="block text-xs text-program/70">
                {memory
                  ? `${memory.games} game${memory.games === 1 ? "" : "s"} so far (${memory.wins} won). This game: ${describeCarry(memory.carry)}.`
                  : "Play on as the same block: districts you wake start the next game stronger, and captured ones carry a scar."}
              </span>
            </span>
          </label>
          {memory && (
            <button type="button" className="ml-6 mt-1 text-xs text-program/60 underline" onClick={() => { if (window.confirm("Start a new block? This one's memory is forgotten.")) { forgetBlock(editionId); setMemory(null); } }}>
              Start a new block
            </button>
          )}
        </div>
      )}
      {playMode === "overlord" && (
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
              <input type="checkbox" className="mt-1" checked={rules.partial} onChange={rule("partial")} />
              <span><b>🎲 Close reads</b><span className="block text-xs text-program/70">One layer short of a trap&apos;s lever, NEGOTIATE rolls a die: 5–6 talks them down (Squeeze −1); anything else, you get played.</span></span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={rules.render} onChange={rule("render")} />
              <span><b><i>Render?</i></b><span className="block text-xs text-program/70">Each player has one Face token. Facing a deal, you can let a teammate who reads that district better read it for you; it costs your Face. The Cookout gives it back. From the novel: the Sight&apos;s offer Marcus learns to refuse.</span></span>
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
