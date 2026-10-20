"use client";
import type { Session } from "../game/session";
import { useEffect, useState } from "react";
import { describeCarry, rememberGame, type BlockMemory } from "../game/block";
import { MoneyCount } from "./MoneyCount";
import { ResultCode } from "./ResultCode";

export function EndScreen({ s, onAgain }: { s: Session; onAgain: () => void }) {
  const g = s.g;
  const won = g.result === "BLOCK_WIN";
  const block = g.blk();
  const standing = block.filter((p) => !p.flipped);
  const legend = standing.length ? standing.reduce((a, p) => (p.legend > a.legend ? p : a), standing[0]) : null;
  const fallen = block.filter((p) => p.flipped);
  const ch = g.chapter;
  const r = ch ? g.chapterResult() : null;
  return (
    <section className={`rounded-2xl border-2 p-6 ${won ? "border-gold bg-gold/10" : "border-[#E63946] bg-[#E63946]/10"}`}>
      <h2 className={`text-3xl font-black ${won ? "text-gold" : "text-[#ff8a8a]"}`}>{won ? "The block wins." : "The Machine holds the block."}</h2>
      <p className="mt-2">
        {won ? `Owner exposed: ${g.ownerFace}. It was always one machine.` : s.endMessage ?? "The clock ran out. The Machine doesn't need to win — it only needs you to run out of time."}
      </p>
      {legend && (
        <p className="mt-3 text-gold">
          Most Props: <b>{legend.name}</b> ({legend.role}) with {legend.legend} Props, earned by lifting people.
        </p>
      )}
      <BlockMemoryNote s={s} />
      <MoneyCount s={s} />
      {g.ed.resources.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#7CFFB2]/40 bg-[#7CFFB2]/10 p-4">
          <h3 className="font-black text-[#7CFFB2]">Real help in {g.ed.city}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {g.ed.resources.map((r) => (
              <li key={r.name}>
                <b>{r.name}</b>: {r.what}{r.where ? <span className="text-program/75"> · {r.where}</span> : null}
              </li>
            ))}
          </ul>
          {g.ed.credits && <p className="mt-2 text-xs text-program/60">From the {g.ed.name}, made by {g.ed.credits}.</p>}
        </div>
      )}
      <ResultCode s={s} />
      {!won && fallen.length > 0 && (
        <p className="mt-3 text-[#ff9b9b]">{fallen[0].name} won the board as the Machine, and earned 0 Props. You win nothing by becoming it.</p>
      )}
      {ch && r && (
        <div className="mt-5 rounded-xl border border-gold/40 bg-black/25 p-4">
          <h3 className="font-black text-gold">The Family Ledger — Chapter {ch.number}: {ch.title}</h3>
          <p className="mt-1">
            Ledger <b>{r.ledger > 0 ? "+" : ""}{r.ledger}</b> · The League {r.league ? "formed" : "never formed"} · REDLINING {r.redlining_broken ? "broken" : "still standing"}
          </p>
          {r.rebuilt.length > 0 && <p>Rebuilt (or heal a Scar): {r.rebuilt.join(", ")}</p>}
          {r.scarred.length > 0 && <p>Scarred: {r.scarred.join(", ")}</p>}
          <p>History unlocked: {r.unlocks.join(", ")}</p>
          {r.rally && <p className="text-[#8be0b5]">The community rallies: next chapter, everyone starts with +1 Trust and one free Commons action.</p>}
          <h4 className="mt-3 font-black text-gold">Family Decision</h4>
          <p className="text-sm">{ch.decision}</p>
        </div>
      )}
      <p className="mt-5 italic text-program/80">How high did you climb before you turned into the thing you were fighting?</p>
      <button className="mt-4 rounded-lg bg-gold px-4 py-2 font-bold text-night" onClick={onAgain}>
        Play again
      </button>
    </section>
  );
}

/** A block that remembers: keep this game, once, and say what the next one starts with. */
function BlockMemoryNote({ s }: { s: Session }) {
  const [memory, setMemory] = useState<BlockMemory | null>(null);
  useEffect(() => {
    if (!s.config.remember) return;
    setMemory(rememberGame(s.g.ed.id, `${s.config.seed}-${s.moves.length}`, s.g)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [s]);
  if (!memory) return null;
  return (
    <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
      🏘 <b>Your block remembers.</b> {memory.games} game{memory.games === 1 ? "" : "s"} together ({memory.wins} won). Next game: {describeCarry(memory.carry)}.
    </p>
  );
}
