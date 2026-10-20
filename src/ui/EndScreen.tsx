"use client";
import type { Session } from "../game/session";

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
