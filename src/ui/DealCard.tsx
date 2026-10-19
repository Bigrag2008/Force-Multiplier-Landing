"use client";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { C, type Card, type District } from "../engine/content";
import { DealAnatomy } from "./DealAnatomy";
import { DISTRICT_COLOR, LAYER_COLOR, LAYER_LABEL, LEVER_WORD, titleCase } from "./theme";

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

function DecoderZone({ text, seed }: { text: string; seed: string }) {
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
}

/**
 * A deal as paperwork. Layers the player's Read unlocks are printed in decoder ink;
 * locked layers carry no text at all. Drag Grandma's reading glasses over the card
 * (or put them on with the button) to read the second number.
 */
export function DealCard({ card, district, sight, effectiveLever, formId }: DealCardProps) {
  const [lensY, setLensY] = useState(110);
  const [glassesOn, setGlassesOn] = useState(false);
  const [explain, setExplain] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const color = DISTRICT_COLOR[district];
  const lever = effectiveLever ?? card.lever;

  const layers = [
    { n: 1, text: card.red + (card.trap ? `   ▸ LEVER: ${LEVER_WORD[lever]}${lever < card.lever ? " (the League reads it together)" : ""}` : "   ▸ HONEST DEAL — no trap, no lever.") },
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
        <header className="flex items-center justify-between px-3 py-1.5 text-white" style={{ background: color }}>
          <span className="text-sm font-black tracking-wide">{district}</span>
          <span className="text-[10px] opacity-90">FORM {formId ?? "—"}</span>
        </header>
        <div className="border-b border-dashed border-black/20 px-3 pb-2 pt-2">
          <div className="flex justify-between text-[9px] font-bold uppercase text-black/50">
            <span>What you see</span>
            <span className="italic normal-case">{C.dayton[district].sub}</span>
          </div>
          <p className="mt-0.5 text-[15px] font-extrabold leading-tight">{card.front}</p>
        </div>
        <div ref={area} className="relative space-y-2 px-3 py-2">
          {layers.map(({ n, text }) => (
            <section key={n}>
              <h4 className="mb-0.5 flex items-center gap-1.5 text-[10px] font-black uppercase">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: LAYER_COLOR[n] }} />
                Read {n} · {LAYER_LABEL[n]}
              </h4>
              {sight >= n ? (
                <>
                  <DecoderZone text={text} seed={card.front + n} />
                  {glassesOn && <span className="sr-only">{text}</span>}
                </>
              ) : (
                <div className="flex min-h-[64px] items-center justify-center rounded-sm border border-dashed border-black/25 text-[12px] text-black/55">
                  🔒 Locked: needs Read {n} in {titleCase(district)}
                </div>
              )}
            </section>
          ))}
          {sight >= 1 && (
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
        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-program/80">
          <span>Drag the red glasses over the card to read it.</span>
          <button className="rounded-md border border-gold/60 px-2 py-1 font-semibold text-gold hover:bg-gold/10" onClick={() => setGlassesOn((v) => !v)}>
            {glassesOn ? "Take glasses off" : "Put glasses on"}
          </button>
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
