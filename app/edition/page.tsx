"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { C, DISTRICTS, type District, type PlaceKey } from "@/engine/content";
import {
  blankEdition, checkEdition, encodeEdition, loadEditions, PLACE_KEYS, readEdition, saveEditions, WEST_DAYTON,
  type Edition, type EditionHistory, type Resource,
} from "@/engine/edition";
import { DISTRICT_COLOR, titleCase } from "@/ui/theme";

/** what each district stands for, so a city can find its own version */
const WHAT: Record<District, string> = {
  LENDING: "Where people borrow and bank: payday lenders, check cashers, title loans, the bank branch that closed.",
  HOUSING: "Where people live: the neighborhoods, the landlords, the houses sold on contract, the blocks that were redlined.",
  LABOR: "Where people work, or used to: the plant that closed, the warehouses, the staffing agencies.",
  HEALTH: "Where people get care, or can't: the hospital that left, the clinics, the bills.",
  EDUCATION: "Where people learn: the high school everyone knows, the community college, the for-profit school on the highway.",
};
const field = "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2";
const blankHistory = (): EditionHistory => ({ title: "", year: "", place: "", story: "", lesson: "", source: "" });

/**
 * Your City editions: make the game about your own side of town. Same rules, same deals; your
 * districts, your gathering places, your history, and where to get real help. Kept on this device;
 * shared as a code or a file.
 */
export default function EditionPage() {
  const [list, setList] = useState<Edition[]>([]);
  const [ed, setEd] = useState<Edition | null>(null);
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => setList(loadEditions()), []); // eslint-disable-line react-hooks/set-state-in-effect

  const store = (next: Edition[]) => (setList(next), saveEditions(next));
  const save = (e: Edition) => {
    store(list.some((x) => x.id === e.id) ? list.map((x) => (x.id === e.id ? e : x)) : [...list, e]);
    setMsg(`Saved “${e.name || "untitled"}” on this device.`);
  };
  const importIt = (text: string) => {
    const e = readEdition(text);
    if (!e) return setMsg("That isn't an edition code or file.");
    const mine = list.some((x) => x.id === e.id) ? { ...e, id: `${e.id}-${Date.now().toString(36)}` } : e;
    store([...list, mine]);
    setImportText("");
    setMsg(`Added “${mine.name}”.`);
  };

  if (ed) return <Editor ed={ed} setEd={setEd} onSave={save} onClose={() => setEd(null)} />;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">Your City editions</h1>
      <p className="mt-2 max-w-3xl text-program/90">
        The traps are the same everywhere. The place isn&apos;t. Make the game about your own side of town: what the five districts are called where
        you live, where people gather, the true history your elders tell, and where to get real help. Same rules, same balance.
      </p>
      <p className="mt-2 text-sm text-program/70">
        Read <b>game/YOUR_CITY.md</b> first: how to research it, check every history card, and make it with your community, not just about it.
      </p>
      {msg && <p className="mt-3 rounded-lg bg-gold/10 px-3 py-2 text-sm" role="status">{msg}</p>}

      <section className="mt-6 space-y-2">
        <EditionRow ed={WEST_DAYTON} note="The reference edition, as the game ships." actions={<>
          <Link href="/play" className="rounded-lg border border-white/25 px-3 py-1.5 text-sm">Play</Link>
          <button className="rounded-lg border border-gold/60 px-3 py-1.5 text-sm font-bold text-gold" onClick={() => setEd({ ...structuredClone(WEST_DAYTON), id: `ed-${Date.now().toString(36)}`, name: "My copy of the West Dayton Edition" })}>Start from it</button>
        </>} />
        {list.map((e) => {
          const problems = checkEdition(e).length;
          return (
            <EditionRow key={e.id} ed={e} note={problems ? `${problems} thing${problems === 1 ? "" : "s"} to finish before it can be played` : "Ready to play and share"} actions={<>
              {!problems && <Link href={`/play?edition=${encodeURIComponent(e.id)}`} className="rounded-lg bg-gold px-3 py-1.5 text-sm font-bold text-night">Play</Link>}
              <button className="rounded-lg border border-white/25 px-3 py-1.5 text-sm" onClick={() => setEd(structuredClone(e))}>Edit</button>
              <button className="rounded-lg border border-white/25 px-3 py-1.5 text-sm" onClick={() => { if (window.confirm(`Delete “${e.name}” from this device?`)) store(list.filter((x) => x.id !== e.id)); }}>Delete</button>
            </>} />
          );
        })}
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-xl bg-gold px-5 py-3 font-black text-night" onClick={() => setEd(blankEdition())}>Start a new edition</button>
      </div>

      <section className="mt-8 rounded-2xl border border-white/15 bg-black/25 p-4">
        <h2 className="font-black text-gold">Add an edition someone shared</h2>
        <textarea aria-label="Edition code" className={`${field} mt-2 h-20 font-mono text-xs`} placeholder="SNE1.eyJ2Ijox…" value={importText} onChange={(e) => setImportText(e.target.value)} />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <button className="rounded-lg bg-gold px-4 py-2 font-bold text-night disabled:opacity-50" disabled={!importText.trim()} onClick={() => importIt(importText)}>Add it</button>
          <label className="cursor-pointer rounded-lg border border-white/25 px-4 py-2">
            Or open a .json file
            <input type="file" accept=".json,application/json" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) importIt(await f.text()); }} />
          </label>
        </div>
      </section>
    </main>
  );
}

function EditionRow({ ed, note, actions }: { ed: Edition; note: string; actions: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 p-3">
      <div>
        <p className="font-black">{ed.name || "Untitled edition"}</p>
        <p className="text-xs text-program/70">{[ed.city, note].filter(Boolean).join(" · ")}</p>
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </div>
  );
}

function Editor({ ed, setEd, onSave, onClose }: { ed: Edition; setEd: (e: Edition) => void; onSave: (e: Edition) => void; onClose: () => void }) {
  const problems = checkEdition(ed);
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<Edition>) => (setEd({ ...ed, ...patch }), setCopied(false));
  const setDistrict = (d: District, k: "sub" | "flavor", v: string) => set({ districts: { ...ed.districts, [d]: { ...ed.districts[d], [k]: v } } });
  const setPlace = (p: PlaceKey, k: "name" | "where" | "flavor", v: string) => set({ places: { ...ed.places, [p]: { ...ed.places[p], [k]: v } } });
  const cards = (d: District | "ANY") => ed.history[d] ?? [];
  const setCards = (d: District | "ANY", next: EditionHistory[]) => set({ history: { ...ed.history, [d]: next } });
  const setRes = (next: Resource[]) => set({ resources: next });
  const code = problems.length ? "" : encodeEdition(ed);
  const download = () => {
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ed, null, 1));
    a.download = `${(ed.name || "edition").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    a.click();
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <button className="text-sm text-gold underline" onClick={onClose}>← Your editions</button>
      <h1 className="mt-4 text-3xl font-black text-gold">{ed.name || "A new edition"}</h1>

      <Section title="The edition">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Its name" hint="“East Side Detroit Edition”"><input className={field} value={ed.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="The city" hint="“Detroit, Michigan”"><input className={field} value={ed.city} onChange={(e) => set({ city: e.target.value })} /></Field>
          <Field label="What the board is called in play" hint="“the East Side” (used as: every deal on the East Side…)"><input className={field} value={ed.area} onChange={(e) => set({ area: e.target.value })} /></Field>
          <Field label="Made by" hint="your group, school or neighborhood"><input className={field} value={ed.credits ?? ""} onChange={(e) => set({ credits: e.target.value })} /></Field>
        </div>
      </Section>

      <Section title="The five districts" sub="The deals in each district stay the same; this is where they happen in your city.">
        {DISTRICTS.map((d) => (
          <div key={d} className="rounded-xl border-l-4 bg-white/5 p-3" style={{ borderColor: DISTRICT_COLOR[d] }}>
            <p className="font-black" style={{ color: DISTRICT_COLOR[d] }}>{titleCase(d)}</p>
            <p className="text-xs text-program/70">{WHAT[d]} West Dayton: <i>{WEST_DAYTON.districts[d].sub}</i>.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_2fr]">
              <Field label="Nickname" hint="shows under the district's name"><input className={field} value={ed.districts[d].sub} onChange={(e) => setDistrict(d, "sub", e.target.value)} /></Field>
              <Field label="What it's like there" hint="one or two true sentences"><textarea className={`${field} h-[42px]`} value={ed.districts[d].flavor} onChange={(e) => setDistrict(d, "flavor", e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Where the block gathers" sub="Five places people really go. What each one does in the game stays the same.">
        {PLACE_KEYS.map((k) => (
          <div key={k} className="rounded-xl bg-white/5 p-3">
            <p className="text-xs text-program/70">West Dayton: <b>{WEST_DAYTON.places[k].name}</b> · in the game: {C.places[k].bonus}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <Field label="Your place"><input className={field} value={ed.places[k].name} onChange={(e) => setPlace(k, "name", e.target.value)} /></Field>
              <Field label="Where it is"><input className={field} value={ed.places[k].where} onChange={(e) => setPlace(k, "where", e.target.value)} /></Field>
              <Field label="Why people go"><input className={field} value={ed.places[k].flavor} onChange={(e) => setPlace(k, "flavor", e.target.value)} /></Field>
            </div>
          </div>
        ))}
      </Section>

      <Section title="Local history" sub="True stories of how your community fought back. The Elder tells them in play. Every card needs a source: a book, an archive, a museum, or an elder by name.">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={ed.historyMode === "replace"} onChange={(e) => set({ historyMode: e.target.checked ? "replace" : "add" })} />
          Use only our cards in districts where we wrote some (otherwise yours join the base game&apos;s)
        </label>
        {([...DISTRICTS, "ANY"] as (District | "ANY")[]).map((d) => (
          <div key={d} className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <p className="font-black">{d === "ANY" ? "Any district" : titleCase(d)} <span className="text-xs font-normal text-program/60">({cards(d).length})</span></p>
              <button className="rounded-lg border border-white/25 px-2 py-1 text-xs" onClick={() => setCards(d, [...cards(d), blankHistory()])}>+ Add a story</button>
            </div>
            {cards(d).map((h, i) => {
              const up = (k: keyof EditionHistory, v: string) => setCards(d, cards(d).map((x, j) => (j === i ? { ...x, [k]: v } : x)));
              return (
                <div key={i} className="mt-2 grid gap-2 rounded-lg border border-white/10 p-2 sm:grid-cols-3">
                  <Field label="Title"><input className={field} value={h.title} onChange={(e) => up("title", e.target.value)} /></Field>
                  <Field label="Year"><input className={field} value={h.year} onChange={(e) => up("year", e.target.value)} /></Field>
                  <Field label="Place"><input className={field} value={h.place} onChange={(e) => up("place", e.target.value)} /></Field>
                  <div className="sm:col-span-3"><Field label="The story (read aloud)"><textarea className={`${field} h-20`} value={h.story} onChange={(e) => up("story", e.target.value)} /></Field></div>
                  <div className="sm:col-span-2"><Field label="The lesson, in one line"><input className={field} value={h.lesson} onChange={(e) => up("lesson", e.target.value)} /></Field></div>
                  <Field label="Source (where you checked it)"><input className={field} value={h.source ?? ""} onChange={(e) => up("source", e.target.value)} /></Field>
                  <button className="text-left text-xs text-program/60 underline sm:col-span-3" onClick={() => setCards(d, cards(d).filter((_, j) => j !== i))}>Remove this story</button>
                </div>
              );
            })}
          </div>
        ))}
      </Section>

      <Section title="Real help near you" sub="Shown at the end of every game in this edition, and on Read your own deal. Only list places you've confirmed are open and do what you say.">
        {ed.resources.map((r, i) => {
          const up = (k: keyof Resource, v: string) => setRes(ed.resources.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
          return (
            <div key={i} className="grid gap-2 rounded-xl bg-white/5 p-3 sm:grid-cols-3">
              <Field label="Name"><input className={field} value={r.name} onChange={(e) => up("name", e.target.value)} /></Field>
              <Field label="What it helps with"><input className={field} placeholder="free tax prep" value={r.what} onChange={(e) => up("what", e.target.value)} /></Field>
              <Field label="Where / how to reach it"><input className={field} value={r.where} onChange={(e) => up("where", e.target.value)} /></Field>
              <button className="text-left text-xs text-program/60 underline sm:col-span-3" onClick={() => setRes(ed.resources.filter((_, j) => j !== i))}>Remove</button>
            </div>
          );
        })}
        <button className="rounded-lg border border-white/25 px-3 py-1.5 text-sm" onClick={() => setRes([...ed.resources, { name: "", what: "", where: "" }])}>+ Add a place</button>
      </Section>

      <Section title="Preview">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {DISTRICTS.map((d) => (
            <div key={d} className="overflow-hidden rounded-lg border-2 bg-white text-ink" style={{ borderColor: DISTRICT_COLOR[d] }}>
              <div className="px-2 py-1 text-center text-white" style={{ background: DISTRICT_COLOR[d] }}>
                <div className="text-xs font-black">{d}</div>
                <div className="text-[10px] italic">{ed.districts[d].sub || "…"}</div>
              </div>
              <p className="p-2 text-[10px] leading-snug">{ed.districts[d].flavor || "…"}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-program/80">The Commons on {ed.area || "…"}: {PLACE_KEYS.map((k) => ed.places[k].name || "…").join(" · ")}</p>
      </Section>

      <div className="sticky bottom-0 mt-8 space-y-3 rounded-t-2xl border border-gold/40 bg-night/95 p-4 backdrop-blur">
        {problems.length > 0 ? (
          <details>
            <summary className="cursor-pointer text-sm text-[#ffd27a]">{problems.length} thing{problems.length === 1 ? "" : "s"} to finish before it can be played or shared</summary>
            <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5 text-xs text-program/80">{problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </details>
        ) : (
          <p className="text-sm text-[#7CFFB2]">Ready to play and share.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg bg-gold px-4 py-2 font-bold text-night" onClick={() => onSave(ed)}>Save on this device</button>
          {!problems.length && (
            <>
              <Link href={`/play?edition=${encodeURIComponent(ed.id)}`} onClick={() => onSave(ed)} className="rounded-lg border border-gold/60 px-4 py-2 font-bold text-gold">Save and play</Link>
              <button className="rounded-lg border border-white/25 px-4 py-2" onClick={async () => { try { await navigator.clipboard.writeText(code); setCopied(true); } catch { setCopied(false); } }}>{copied ? "Code copied ✓" : "Copy a share code"}</button>
              <button className="rounded-lg border border-white/25 px-4 py-2" onClick={download}>Download as a file</button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 space-y-3">
      <div>
        <h2 className="text-xl font-black text-gold">{title}</h2>
        {sub && <p className="text-sm text-program/70">{sub}</p>}
      </div>
      {children}
    </section>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-bold">{label}</span>
      <span className="mt-1 block">{children}</span>
      {hint && <span className="mt-0.5 block text-xs text-program/55">{hint}</span>}
    </label>
  );
}
