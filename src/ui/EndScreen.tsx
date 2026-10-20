"use client";
import type { Session } from "../game/session";
import { useEffect, useState } from "react";
import { describeCarry, rememberGame, type BlockMemory } from "../game/block";
import { C } from "../engine/content";
import { nextChapter } from "../engine/campaign";
import { describeStickers, FLAG_WORDS, recordChapter, type CampaignKey, type Family } from "../game/family";
import { MoneyCount } from "./MoneyCount";
import { ResultCode } from "./ResultCode";
import { t, useLang } from "../i18n";
import { titleCase } from "./theme";

export function EndScreen({ s, onAgain }: { s: Session; onAgain: () => void }) {
  useLang();
  const g = s.g;
  const won = g.result === "BLOCK_WIN";
  const block = g.blk();
  const standing = block.filter((p) => !p.flipped);
  const legend = standing.length ? standing.reduce((a, p) => (p.legend > a.legend ? p : a), standing[0]) : null;
  const fallen = block.filter((p) => p.flipped);
  const ch = g.chapter;
  const r = ch ? g.chapterResult() : null;
  const porch = ch?.throne && won;
  return (
    <section className={`rounded-2xl border-2 p-6 ${won ? "border-gold bg-gold/10" : "border-[#E63946] bg-[#E63946]/10"}`}>
      <h2 className={`text-3xl font-black ${won ? "text-gold" : "text-[#ff8a8a]"}`}>{won ? t("The block wins.") : t("The Machine holds the block.")}</h2>
      <p className="mt-2">
        {won ? t("Owner exposed: {face}. It was always one machine.", { face: t(g.ownerFace) }) : s.endMessage ? t(s.endMessage) : t("The clock ran out. The Machine doesn't need to win — it only needs you to run out of time.")}
      </p>
      {legend && (
        <p className="mt-3 text-gold">
          {t("Most Props:")} <b>{legend.name}</b> {t("({role}) with {n} Props, earned by lifting people.", { role: t(legend.role), n: legend.legend })}
        </p>
      )}
      <BlockMemoryNote s={s} />
      <MoneyCount s={s} />
      {g.ed.resources.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#7CFFB2]/40 bg-[#7CFFB2]/10 p-4">
          <h3 className="font-black text-[#7CFFB2]">{t("Real help in {city}", { city: g.ed.city })}</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {g.ed.resources.map((r) => (
              <li key={r.name}>
                <b>{r.name}</b>: {t(r.what)}{r.where ? <span className="text-program/75"> · {t(r.where)}</span> : null}
              </li>
            ))}
          </ul>
          {g.ed.credits && <p className="mt-2 text-xs text-program/60">{t("From the {name}, made by {credits}.", { name: t(g.ed.name), credits: g.ed.credits })}</p>}
        </div>
      )}
      <ResultCode s={s} />
      {!won && fallen.length > 0 && (
        <p className="mt-3 text-[#ff9b9b]">{t("{name} won the board as the Machine, and earned 0 Props. You win nothing by becoming it.", { name: fallen[0].name })}</p>
      )}
      {ch && r && <FamilyLedger s={s} />}
      {porch && (
        <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3">
          📖 <b>{t("The last scene of Book One is on a porch.")}</b> {t("You won: open the book to it and read it aloud, together.")}
        </p>
      )}
      <p className="mt-5 italic text-program/80">{t("How high did you climb before you turned into the thing you were fighting?")}</p>
      <button className="mt-4 rounded-lg bg-gold px-4 py-2 font-bold text-night" onClick={onAgain}>
        {t("Play again")}
      </button>
    </section>
  );
}

/** A block that remembers: keep this game, once, and say what the next one starts with. */
function BlockMemoryNote({ s }: { s: Session }) {
  useLang();
  const [memory, setMemory] = useState<BlockMemory | null>(null);
  useEffect(() => {
    if (!s.config.remember) return;
    setMemory(rememberGame(s.g.ed.id, `${s.config.seed}-${s.moves.length}`, s.g)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [s]);
  if (!memory) return null;
  return (
    <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
      🏘 <b>{t("Your block remembers.")}</b> {memory.games === 1 ? t("1 game together ({w} won).", { w: memory.wins }) : t("{n} games together ({w} won).", { n: memory.games, w: memory.wins })} {t("Next game: {carry}.", { carry: t(describeCarry(memory.carry)) })}
    </p>
  );
}

const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/**
 * The end of a campaign chapter: what it writes into the family's record, and (The Long Ledger) the
 * Family Decision that changes the next chapter. Playing as the saved family, the chapter is written
 * down once the table decides.
 */
function FamilyLedger({ s }: { s: Session }) {
  const g = s.g;
  const ch = g.chapter!;
  const r = g.chapterResult();
  useLang();
  const camp = ch.campaign as CampaignKey;
  const id = `${s.config.seed}-${s.moves.length}`;
  const [fam, setFam] = useState<Family | null>(null);
  const write = (decision: string | null) => s.config.family && setFam(recordChapter(camp, id, ch.key, r, decision));
  // Book One has no Family Decision: write it down at once
  useEffect(() => {
    if (s.config.family && !ch.decision) setFam(recordChapter(camp, id, ch.key, r, null)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [s]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = fam ? nextChapter(fam.state) : null;
  const title = camp === "LEDGER" ? t("The Family Ledger") : t("Book One");
  return (
    <div className="mt-5 rounded-xl border border-gold/40 bg-black/25 p-4">
      <h3 className="font-black text-gold">
        {t("{book}, Chapter {n}: {title}", { book: title, n: ch.number, title: t(ch.title) })}
      </h3>
      <p className="mt-1">
        {t("Ledger")} <b>{signed(r.ledger)}</b>
        {g.hasLeague() && <> · {r.league ? t("The League formed") : t("The League never formed")} · {r.redlining_broken ? t("REDLINING broken") : t("REDLINING still standing")}</>}
      </p>
      {camp === "LEDGER" && (
        <>
          {r.rebuilt.length > 0 && <p>{t("Rebuilt (or a Scar healed):")} {r.rebuilt.map(titleCase).join(", ")}</p>}
          {r.scarred.length > 0 && <p>{t("Scarred:")} {r.scarred.map(titleCase).join(", ")}</p>}
          {r.unlocks.length > 0 && <p>{t("History unlocked:")} {r.unlocks.map((u) => t(u)).join(", ")}</p>}
          {r.rally && <p className="text-[#8be0b5]">{t("The community rallies: next chapter, everyone starts with +1 Trust.")}</p>}
        </>
      )}
      {ch.after && <p className="mt-1 text-sm text-program/85">{t(ch.after)}</p>}
      {camp === "BOOK_ONE" && (
        <ul className="mt-1 text-sm">
          {ch.key === "B1_CHAIN" && r.burned && <li>⚠ {t("Somebody was burned by the Terrell rule: the ledger reads")} <b>Terrell</b>.</li>}
          {ch.key === "B1_CHAIN" && r.won && <li>✦ {t("The block learns")} <b>{t("Civic Armor")}</b>.</li>}
          {ch.key === "B1_NET" && r.quit_desk && <li>🪑 {t("{name} quit the Desk: Read 1 everywhere in Chapter 3.", { name: r.quit_desk })}</li>}
          {ch.key === "B1_CROWN" && <li>👑 {r.crown ? t("{name} wore the Crown.", { name: r.crown }) : t("Nobody wore the Crown.")}</li>}
        </ul>
      )}
      {ch.decision && s.config.family && !fam && (
        <div className="mt-3">
          <h4 className="font-black text-gold">{t("Family Decision:")} {t(ch.decision.text)}</h4>
          <p className="text-xs text-program/70">{t("Argue it out. It changes the next chapter, and it's written on the lineage sheet.")}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ch.decision.options.map((o) => (
              <button key={o.key} className="rounded-lg border border-gold/60 px-3 py-2 text-left hover:bg-gold/10" onClick={() => write(o.key)}>
                <b>{t(o.label)}</b>
                <span className="block text-xs text-program/80">{t(o.text)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {ch.decision && !s.config.family && (
        <p className="mt-2 text-sm">
          <b>{t("Family Decision:")}</b> {t(ch.decision.text)} {ch.decision.options.map((o) => `${t(o.label)}: ${t(o.text)}`).join(" ")}
        </p>
      )}
      {fam && (
        <p className="mt-3 rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm">
          📜 <b>{t("Written into the family.")}</b> {fam.state.played.length === 1 ? t("Ledger {n} after 1 chapter.", { n: signed(fam.state.ledger) }) : t("Ledger {n} after {c} chapters.", { n: signed(fam.state.ledger), c: fam.state.played.length })}
          {camp === "LEDGER" && <> {t("Board: {stickers}.", { stickers: t(describeStickers(fam.state)) })}</>}
          {fam.state.flags.length > 0 && <> {fam.state.flags.map((f) => (FLAG_WORDS[f] ? t(FLAG_WORDS[f]) : f)).join("; ")}.</>}{" "}
          {next ? (
            <>{t("Next: Chapter {n},", { n: C.chapters[next].number })} <i>{t(C.chapters[next].title)}</i>. {t("Choose Play again, then Campaign.")}</>
          ) : (
            <b>{t("The family has played every chapter.")}</b>
          )}
        </p>
      )}
      {fam && !next && camp === "LEDGER" && (
        <p className="mt-2 text-sm">
          {t("Read the Family Ledger aloud ({n}), then the lineage sheet, name by name.", { n: signed(fam.state.ledger) })}
          {fam.state.unlocks.length > 0 && <> {t("The History your family lived: {list}.", { list: fam.state.unlocks.map((u) => t(u)).join(", ") })}</>}
        </p>
      )}
    </div>
  );
}
