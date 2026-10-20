"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addResults, CLASS, classPicture, decodeAll, HISTORY, loadList, saveList, toCsv, type GameResult } from "@/game/results";
import { DISTRICT_COLOR, titleCase } from "@/ui/theme";

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const OUT_WORD: Record<string, string> = { taken: "signed as a shortcut", played: "got played", conned: "conned (a counterfeit)", refused: "walked away from real help" };

/**
 * The teacher's view: every game the class sends in (as result codes) and every game played on this
 * device, added up. Nothing is uploaded: the codes are pasted here and kept in this browser.
 */
export default function TeacherPage() {
  const [pasted, setPasted] = useState<GameResult[]>([]);
  const [local, setLocal] = useState<GameResult[]>([]);
  const [withLocal, setWithLocal] = useState(true);
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => {
    setPasted(loadList(CLASS)); // eslint-disable-line react-hooks/set-state-in-effect
    setLocal(loadList(HISTORY));
  }, []);
  const list = useMemo(() => addResults(pasted, withLocal ? local : []), [pasted, local, withLocal]);
  const pic = useMemo(() => classPicture(list), [list]);
  const add = () => {
    const { results, bad } = decodeAll(text);
    const next = addResults(pasted, results);
    const added = next.length - pasted.length;
    setPasted(next);
    saveList(CLASS, next);
    setText("");
    setNote(`${added} game${added === 1 ? "" : "s"} added${results.length > added ? `, ${results.length - added} already here` : ""}${bad ? `, ${bad} line${bad === 1 ? "" : "s"} weren't result codes` : ""}.`);
  };
  const remove = (id: string) => {
    const next = pasted.filter((r) => r.id !== id);
    setPasted(next);
    saveList(CLASS, next);
  };
  const csv = () => {
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(toCsv(list));
    a.download = "second-number-class.csv";
    a.click();
  };
  const clocked = pic.clock.rushed + pic.clock.waited;
  const top = pic.fooled.slice(0, 8);
  // the one to talk through: the trap that fooled the most tables (an honest deal walked away from, only if that's all there is)
  const talk = pic.fooled.find((f) => f.trap && f.red) ?? pic.fooled.find((f) => f.red);
  const max = Math.max(1, ...top.map((f) => f.times));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="text-sm text-gold underline">← The Second Number</Link>
      <h1 className="mt-4 text-4xl font-black text-gold">Teacher&apos;s view</h1>
      <p className="mt-2 max-w-3xl text-program/90">
        Every game your class sends in, added up: which traps fooled them, how their reading grew, and what the deals would have cost in real money.
        At the end of a game each table opens <b>Send this game to your teacher</b> and copies its result code to you. Paste the codes here.
      </p>
      <p className="mt-2 rounded-lg border border-[#7CFFB2]/40 bg-[#7CFFB2]/10 px-3 py-2 text-sm text-program/90">
        🔒 No accounts and no upload. Codes hold only the first names students typed and how the game went, and they stay in this browser.
      </p>
      <p className="mt-3">
        <Link href="/teacher/guide" className="inline-block rounded-lg border border-gold px-4 py-2 font-bold text-gold hover:bg-gold/10">
          📄 The teacher&apos;s guide: goals, a 50-minute plan and questions for after
        </Link>
      </p>

      <section className="mt-6 rounded-2xl border border-gold/40 bg-black/25 p-4">
        <label className="block font-bold" htmlFor="codes">Paste result codes (one or many)</label>
        <textarea id="codes" className="mt-2 h-24 w-full rounded-lg border border-white/20 bg-black/40 p-2 font-mono text-xs" placeholder="SN1.eyJ2Ijox…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <button className="rounded-lg bg-gold px-4 py-2 font-bold text-night disabled:opacity-50" disabled={!text.trim()} onClick={add}>
            Add to the class
          </button>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={withLocal} onChange={(e) => setWithLocal(e.target.checked)} /> Include games played on this device ({local.length})
          </label>
          {note && <span className="text-program/80" role="status">{note}</span>}
        </div>
      </section>

      {list.length === 0 ? (
        <p className="mt-8 text-program/70">
          No games yet. Play one (a <Link href="/play" className="text-gold underline">Block Party</Link> fits a class period), or paste the codes your tables send.
        </p>
      ) : (
        <>
          <p className="mt-8 text-xl leading-snug">
            Across {pic.games} game{pic.games === 1 ? "" : "s"}, the class signed <b className="text-[#ff8a8a]">{usd(pic.money.taken)}</b> of traps
            {pic.money.refused > 0 && <> and walked away from <b className="text-[#ffd27a]">{usd(pic.money.refused)}</b> of real help</>}. They stayed out of{" "}
            <b className="text-[#7CFFB2]">{usd(pic.money.defused + pic.money.dodged)}</b>.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Tile label="Games" value={String(pic.games)} />
            <Tile label="Block wins" value={`${Math.round((pic.wins / pic.games) * 100)}%`} sub={`${pic.wins} of ${pic.games}`} />
            <Tile label="Average Read at the end" value={pic.read.toFixed(1)} sub="0 = can't read · 3 = reads blue" />
            <Tile label="Got played or conned" value={usd(pic.money.played)} />
          </dl>

          <section className="mt-8">
            <h2 className="text-xl font-black text-gold">The deals that fooled the class most</h2>
            <p className="text-sm text-program/70">Times a table signed it as a shortcut, got played or conned by it, or walked away from it when it was honest.</p>
            {top.length === 0 ? (
              <p className="mt-2 text-program/70">Nothing fooled anyone yet.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {top.map((f) => (
                  <li key={`${f.d}|${f.front}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                    <span className="flex items-start gap-2 text-sm">
                      <span aria-hidden className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: DISTRICT_COLOR[f.d] }} />
                      <span>
                        <span className="text-program/60">{titleCase(f.d)} · </span>
                        {f.front}
                      </span>
                    </span>
                    <span className="flex items-center gap-2" title={Object.entries(f.outs).map(([o, n]) => `${n} ${OUT_WORD[o] ?? o}`).join(" · ")}>
                      <span className="block h-5 max-h-6 rounded-r bg-[#E63946]" style={{ width: `${(f.times / max) * 100}%`, minWidth: 6 }} />
                      <span className="shrink-0 text-sm font-bold tabular-nums">{f.times}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {talk && (
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm">
                <p className="font-black text-gold">Talk it through: &ldquo;{talk.front}&rdquo;</p>
                {talk.counterfeit ? (
                  <p className="mt-1"><b className="text-[#c9a2ff]">What it really was (Read 3, the blue layer):</b> {talk.blue}</p>
                ) : (
                  <p className="mt-1"><b className="text-[#ff8a8a]">{talk.trap ? "The second number:" : "Why it was honest:"}</b> {talk.red}</p>
                )}
                {talk.dollars ? <p className="mt-1"><b>Real money:</b> {usd(talk.dollars)}, {talk.basis}.</p> : null}
                <p className="mt-2 italic text-program/80">
                  {talk.counterfeit
                    ? "Ask: it read exactly like honest help. Who checks who's really behind a deal before you sign?"
                    : talk.trap
                      ? "Ask: what would you have to know to see this one coming? Who in your life could you ask?"
                      : "Ask: this one was honest, and the table walked away. What made real help look like a trap?"}
                </p>
              </div>
            )}
          </section>

          {clocked > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-black text-gold">Sign-now clocks</h2>
              <p className="mt-1 text-sm text-program/85">
                Of {clocked} decision{clocked === 1 ? "" : "s"} on a deal with a fake deadline, <b>{pic.clock.rushed}</b> were made with the clock still running and{" "}
                <b>{pic.clock.waited}</b> waited it out.
              </p>
              <div className="mt-2 h-3 w-full max-w-md overflow-hidden rounded-full bg-[#7CFFB2]/25" role="img" aria-label={`${Math.round((pic.clock.rushed / clocked) * 100)}% rushed`}>
                <div className="h-full rounded-r-full bg-[#E63946]" style={{ width: `${(pic.clock.rushed / clocked) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-program/60">Red: decided under the clock. Green: waited it out.</p>
            </section>
          )}

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-black text-gold">Every game</h2>
              <button className="rounded-lg border border-gold/60 px-3 py-1.5 text-sm font-bold text-gold" onClick={csv}>
                Download a spreadsheet (CSV)
              </button>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-program/60">
                  <tr>
                    {["Date", "Table", "Mode", "Result", "Rounds", "Avg Read", "Signed", "Stayed out of", "Clock: rushed / waited", ""].map((h) => (
                      <th key={h} className="border-b border-white/15 px-2 py-1 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...list].reverse().map((r) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="px-2 py-1 tabular-nums">{new Date(r.at).toLocaleDateString()}</td>
                      <td className="px-2 py-1">{r.table || r.names.join(", ")}</td>
                      <td className="px-2 py-1">{r.mode}</td>
                      <td className="px-2 py-1">{r.won ? "✦ won" : "lost"}</td>
                      <td className="px-2 py-1 tabular-nums">{r.rounds}/{r.maxRounds}</td>
                      <td className="px-2 py-1 tabular-nums">{r.read.toFixed(1)}</td>
                      <td className="px-2 py-1 tabular-nums">{usd(r.money.taken)}</td>
                      <td className="px-2 py-1 tabular-nums">{usd(r.money.defused + r.money.dodged)}</td>
                      <td className="px-2 py-1 tabular-nums">{r.clock.rushed} / {r.clock.waited}</td>
                      <td className="px-2 py-1">
                        {pasted.some((x) => x.id === r.id) ? (
                          <button className="text-xs text-program/60 underline" onClick={() => remove(r.id)} aria-label={`Remove the game from ${new Date(r.at).toLocaleDateString()}`}>
                            remove
                          </button>
                        ) : (
                          <span className="text-xs text-program/50">this device</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-program/60">
              Dollar figures are typical real-world amounts for one household, from each card (see the rulebook&apos;s answer key). Games played on this device can be
              hidden with the checkbox above.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
      <dt className="text-xs text-program/70">{label}</dt>
      <dd className="text-2xl font-black">{value}</dd>
      {sub && <dd className="text-xs text-program/60">{sub}</dd>}
    </div>
  );
}
