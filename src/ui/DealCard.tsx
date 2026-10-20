"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { C, type Card, type District } from "../engine/content";
import { DealAnatomy } from "./DealAnatomy";
import { DISTRICT_MARK, DISTRICT_SURFACE, LAYER_COLOR, LAYER_LABEL, LEVER_WORD, titleCase } from "./theme";

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%";
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Deterministic rows of red decoy letters (the camouflage), same on every render. */
function decoyRows(seed: string, rows: number, cols: number) {
  let x = hash(seed) || 1;
  const next = () => ((x = Math.imul(x ^ (x >>> 13), 1597334677) >>> 0), x);
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => LETTERS[next() % LETTERS.length]).join(""));
}

/** "Plain cards": the hidden layers you can read, in plain dark text, for anyone the red-lens effect doesn't work for */
const PLAIN_KEY = "sn-plain-cards";
function usePlainCards(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(window.localStorage.getItem(PLAIN_KEY) === "on"); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      // no storage: lens cards
    }
  }, []);
  const set = (v: boolean) => {
    setOn(v);
    try {
      window.localStorage.setItem(PLAIN_KEY, v ? "on" : "off");
    } catch {
      // the setting lasts this visit
    }
  };
  return [on, set];
}

function DecoderZone({ text, seed, plain }: { text: string; seed: string; plain?: boolean }) {
  if (plain)
    return (
      <p className="rounded-sm border border-black/20 bg-white px-1.5 py-1 text-[13px] font-bold leading-snug text-ink" style={{ minHeight: 64 }}>
        {text}
      </p>
    );
  return (
    <div className="relative overflow-hidden rounded-sm" style={{ background: "#FFEDED", minHeight: 64 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none font-bold leading-[7px]" style={{ color: "#ED2633", fontSize: 10 }}>
        {decoyRows(seed + "u", 14, 60).map((r, i) => (
          <div key={i} style={{ marginLeft: (i % 3) * -3 }}>{r}</div>
        ))}
      </div>
      <p className="relative px-1.5 py-1 text-[12px] font-extrabold leading-[15px]" style={{ color: "#00D1FF" }}>
        {text}
      </p>
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none font-bold leading-[11px]" style={{ color: "#ED2633", fontSize: 10, top: 3 }}>
        {decoyRows(seed + "o", 9, 60).map((r, i) => (
          <div key={i} style={{ marginLeft: (i % 2) * -4 }}>{r}</div>
        ))}
      </div>
    </div>
  );
}

export interface DealCardProps {
  card: Card;
  district: District;
  sight: number;
  effectiveLever?: number;
  formId?: string;
  /** the math variant: work out an endless deal's second number before the red layer opens */
  math?: boolean;
  /** a real deal (Bring your own deal): no game lever on the red layer */
  plain?: boolean;
  /** the label in the header, instead of the district */
  heading?: string;
  /** the district's local nickname (from the game's edition) */
  sub?: string;
}

/** The math variant: the red layer stays shut until you've worked out the second number. */
function WorkItOut({ card, onDone }: { card: Card; onDone: (guess: string) => void }) {
  const [guess, setGuess] = useState("");
  return (
    <form
      className="rounded-sm border-2 border-dashed border-[#ED2633] bg-[#FFEDED] p-2 text-[12px]"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(guess);
      }}
    >
      <p className="font-extrabold">Work out the second number</p>
      <p className="mt-0.5">{card.ask}</p>
      <div className="mt-1 flex gap-2">
        <input aria-label="Your answer" inputMode="numeric" className="w-28 rounded border border-black/30 px-2 py-0.5" value={guess} onChange={(e) => setGuess(e.target.value)} />
        <button type="submit" className="rounded bg-ink px-2 py-0.5 font-bold text-program">Check</button>
      </div>
    </form>
  );
}

/**
 * A deal as paperwork. Layers the player's Read unlocks are printed in decoder ink;
 * locked layers carry no text at all. Drag Grandma's reading glasses over the card
 * (or put them on with the button) to read the second number.
 */
export function DealCard({ card, district, sight, effectiveLever, formId, math, plain, heading, sub }: DealCardProps) {
  // the math variant: which card's second number has been worked out, and what the guess was
  const [worked, setWorked] = useState<{ card: Card; guess: string } | null>(null);
  const needsMath = !!math && card.answer !== undefined && sight >= 1 && worked?.card !== card;
  const [lensY, setLensY] = useState(110);
  const [glassesOn, setGlassesOn] = useState(false);
  const [explain, setExplain] = useState(false);
  const [plainCards, setPlainCards] = usePlainCards();
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const lever = effectiveLever ?? card.lever;

  const layers = [
    { n: 1, text: plain ? card.red : card.red + (card.trap ? `   ▸ LEVER: ${LEVER_WORD[lever]}${lever < card.lever ? " (the League reads it together)" : ""}` : "   ▸ HONEST DEAL — no trap, no lever.") },
    { n: 2, text: card.amber },
    { n: 3, text: card.blue },
  ];

  const move = (clientY: number) => {
    const box = area.current?.getBoundingClientRect();
    if (!box) return;
    setLensY(Math.max(0, Math.min(box.height - 70, clientY - box.top - 35)));
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e.clientY);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current === e.pointerId) move(e.clientY);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") setLensY((y) => y + 12);
    if (e.key === "ArrowUp") setLensY((y) => Math.max(0, y - 12));
  };

  return (
    <div className="w-full max-w-sm">
      <article className="relative isolate overflow-hidden rounded-xl border border-black/40 bg-program text-ink shadow-xl" aria-label={`Deal in ${titleCase(district)}`}>
        <header className="flex items-center justify-between px-3 py-1.5" style={{ background: DISTRICT_SURFACE[district].bg, color: DISTRICT_SURFACE[district].fg }}>
          <span className="text-sm font-black tracking-wide">{heading ?? <><span aria-hidden>{DISTRICT_MARK[district]} </span>{district}</>}</span>
          <span className="text-[10px] opacity-90">FORM {formId ?? "—"}</span>
        </header>
        {card.die !== undefined && (
          <p className="bg-black/5 px-3 py-1 text-[11px] font-bold">🎲 The fine print rolled {card.die}: this trap&apos;s lever is in {LEVER_WORD[card.lever]}.</p>
        )}
        <div className="border-b border-dashed border-black/20 px-3 pb-2 pt-2">
          <div className="flex justify-between text-[9px] font-bold uppercase text-black/70">
            <span>What you see</span>
            <span className="italic normal-case">{plain ? "your real deal" : (sub ?? C.dayton[district].sub)}</span>
          </div>
          <p className="mt-0.5 text-[15px] font-extrabold leading-tight">{card.front}</p>
        </div>
        <div ref={area} className="relative space-y-2 px-3 py-2">
          {layers.map(({ n, text }) => (
            <section key={n}>
              <h3 className="mb-0.5 flex items-center gap-1.5 text-[10px] font-black uppercase">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: LAYER_COLOR[n] }} />
                Read {n} · {LAYER_LABEL[n]}
              </h3>
              {n === 1 && needsMath ? (
                <WorkItOut card={card} onDone={(guess) => setWorked({ card, guess })} />
              ) : sight >= n ? (
                <>
                  {n === 1 && worked?.card === card && card.answer !== undefined && (
                    <p className="mb-1 text-[11px] font-bold">
                      {Number(worked.guess.replace(/[^0-9.-]/g, "")) === card.answer ? "✓ You got it: " : `You said ${worked.guess || "nothing"}. The second number: `}
                      {card.answer.toLocaleString("en-US")}
                    </p>
                  )}
                  <DecoderZone text={text} seed={card.front + n} plain={plainCards} />
                </>
              ) : (
                <div className="flex min-h-[64px] items-center justify-center rounded-sm border border-dashed border-black/25 text-[12px] text-black/55">
                  🔒 Locked: needs Read {n} in {titleCase(district)}
                </div>
              )}
            </section>
          ))}
          {sight >= 1 && !plainCards && (
            <div
              role="slider"
              aria-label="Reading glasses: drag up and down to read the second number"
              aria-valuenow={Math.round(lensY)}
              tabIndex={0}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={() => (drag.current = null)}
              onKeyDown={onKey}
              className="absolute inset-x-1 z-10 flex cursor-grab touch-none active:cursor-grabbing"
              // the blend lives on the wrapper: a z-indexed wrapper would otherwise trap its children's blend
              style={{ ...(glassesOn ? { top: 0, bottom: 0 } : { top: lensY, height: 70 }), mixBlendMode: "multiply" }}
            >
              {[0, 1].map((i) => (
                <div key={i} className={`flex-1 border-[4px] border-night ${i ? "rounded-r-[22px] border-l-[2px]" : "rounded-l-[22px] border-r-[2px]"}`} style={{ background: "#FF0000" }} />
              ))}
            </div>
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-black/10 px-3 py-1.5 text-[10px] text-black/55">
          <span className="font-bold text-black/70">X ____________</span>
          <span>TAKE · WALK · NEGOTIATE</span>
        </footer>
      </article>
      {sight >= 1 ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-program/80">
          <span>{plainCards ? "Plain cards: the layers you can read, in plain text." : "Drag the red glasses over the card to read it."}</span>
          <span className="flex gap-2">
            {!plainCards && (
              <button className="rounded-md border border-gold/60 px-2 py-1 font-semibold text-gold hover:bg-gold/10" aria-pressed={glassesOn} onClick={() => setGlassesOn((v) => !v)}>
                {glassesOn ? "Take glasses off" : "Put glasses on"}
              </button>
            )}
            <button
              className="rounded-md border border-white/30 px-2 py-1 font-semibold hover:bg-white/10"
              aria-pressed={plainCards}
              title="For anyone the red-lens effect doesn't work for: color-blind players, low vision, screen readers"
              onClick={() => setPlainCards(!plainCards)}
            >
              {plainCards ? "Lens cards" : "Plain cards"}
            </button>
          </span>
        </div>
      ) : (
        <p className="mt-2 text-xs text-program/80">Read 0 in {titleCase(district)}: you can only see the pitch. Most deals are traps.</p>
      )}
      <button className="mt-1 text-xs font-semibold text-[#7CFFB2] underline" aria-expanded={explain} onClick={() => setExplain((v) => !v)}>
        {explain ? "Hide the card guide" : "What's on this card?"}
      </button>
      {explain && <DealAnatomy />}
    </div>
  );
}
