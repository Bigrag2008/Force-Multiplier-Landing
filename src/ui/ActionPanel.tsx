"use client";
import { useState, type ReactNode } from "react";
import { C, DISTRICTS, K, type Card, type District, type PlaceKey } from "../engine/content";
import type { Action, Player } from "../engine/engine";
import type { Session } from "../game/session";
import { DealCard } from "./DealCard";
import { DISTRICT_COLOR, titleCase } from "./theme";

type Run = (fn: (s: Session) => void) => void;
type Pending =
  | { k: "menu" }
  | { k: "pick"; for: "study" | "face" | "history" | "trace" }
  | { k: "choose"; d: District; cards: Card[] }
  | { k: "face"; d: District; card: Card }
  | { k: "teachWho" }
  | { k: "teachWhere"; t: Player }
  | { k: "respond"; t: Player; d: District; card: Card }
  | { k: "commons" }
  | { k: "reach" };

const btn = "rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${btn} bg-gold text-night hover:brightness-110`;
const ghost = `${btn} border border-white/25 text-program hover:bg-white/10`;

function Panel({ title, children, sub }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gold/40 bg-night/80 p-4 shadow-lg">
      <h2 className="text-lg font-black text-gold">{title}</h2>
      {sub && <div className="mt-0.5 text-sm text-program/80">{sub}</div>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function DistrictButtons({ onPick, disabled, note }: { onPick: (d: District) => void; disabled?: (d: District) => boolean; note?: (d: District) => string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {DISTRICTS.map((d) => (
        <button key={d} className={`${btn} text-white`} style={{ background: DISTRICT_COLOR[d] }} disabled={disabled?.(d)} onClick={() => onPick(d)}>
          {titleCase(d)}
          {note && <span className="block text-[10px] font-normal opacity-90">{note(d)}</span>}
        </button>
      ))}
    </div>
  );
}

const formId = (s: Session, d: District, card: Card) => `${d.slice(0, 3)}-${String(s.g.deck[d].indexOf(card) + 1).padStart(2, "0")}`;

/** The current player's turn. Keyed by the parent per action, so its local state resets. */
export function TurnPanel({ s, run, onHistory }: { s: Session; run: Run; onHistory: () => void }) {
  const [pending, setPending] = useState<Pending>({ k: "menu" });
  const g = s.g;
  const p = s.player;
  const others = g.active().filter((x) => x !== p);
  const back = (
    <button className={ghost} onClick={() => setPending({ k: "menu" })}>
      Back
    </button>
  );
  const act = (a: Action) => run((x) => x.act(a));

  if (pending.k === "pick") {
    const f = pending.for;
    const title = { study: "Study which district?", face: "Face a deal where?", history: "Teach the History of…", trace: "Trace the thread under…" }[f];
    return (
      <Panel title={title}>
        <DistrictButtons
          disabled={(d) => (f === "study" ? p.sight[d] >= 3 : f === "trace" ? !g.canTrace(p, d) : false)}
          note={(d) => (f === "history" ? `wakes ${titleCase(d)}` : `your Sight ${p.sight[d]}`)}
          onPick={(d) => {
            if (f === "study") act({ k: "study", d });
            else if (f === "trace") act({ k: "trace", d });
            else if (f === "history") {
              act({ k: "history", d });
              onHistory();
            } else {
              const cards = g.dealsFor(p, d);
              setPending(cards.length > 1 ? { k: "choose", d, cards } : { k: "face", d, card: cards[0] });
            }
          }}
        />
        {f !== "face" && back}
      </Panel>
    );
  }

  if (pending.k === "choose")
    return (
      <Panel title="You shopped around: two deals" sub="Read both, then face one.">
        <div className="grid gap-4 md:grid-cols-2">
          {pending.cards.map((card, i) => (
            <div key={i} className="space-y-2">
              <DealCard card={card} district={pending.d} sight={p.sight[pending.d]} effectiveLever={g.lever(pending.d, card)} formId={formId(s, pending.d, card)} />
              <button className={primary} onClick={() => setPending({ k: "face", d: pending.d, card })}>
                Face this deal
              </button>
            </div>
          ))}
        </div>
      </Panel>
    );

  if (pending.k === "face") {
    const { d, card } = pending;
    const cost = g.negCost(d);
    return (
      <Panel title={`${p.name} faces a deal in ${titleCase(d)}`} sub="Read what your Sight allows, then decide.">
        <DealCard card={card} district={d} sight={p.sight[d]} effectiveLever={g.lever(d, card)} formId={formId(s, d, card)} />
        <div className="grid gap-2 sm:grid-cols-3">
          <button className={primary} onClick={() => act({ k: "face", d, choice: "TAKE", card })}>
            TAKE
            <span className="block text-[11px] font-normal">accept it</span>
          </button>
          <button className={primary} onClick={() => act({ k: "face", d, choice: "WALK", card })}>
            WALK
            <span className="block text-[11px] font-normal">refuse it</span>
          </button>
          <button className={primary} disabled={p.trust < cost} onClick={() => act({ k: "face", d, choice: "NEGOTIATE", card })}>
            NEGOTIATE
            <span className="block text-[11px] font-normal">{cost} Trust · beats a trap if Sight ≥ lever</span>
          </button>
        </div>
      </Panel>
    );
  }

  if (pending.k === "teachWho")
    return (
      <Panel title="Teach whom?" sub="You can only teach a district you read better than they do.">
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((t) => (
            <button key={t.name} className={ghost} disabled={!DISTRICTS.some((d) => p.sight[d] > t.sight[d])} onClick={() => setPending({ k: "teachWhere", t })}>
              {t.name} <span className="text-xs font-normal">the {t.role}</span>
            </button>
          ))}
        </div>
        {back}
      </Panel>
    );

  if (pending.k === "teachWhere") {
    const t = pending.t;
    return (
      <Panel title={`Teach ${t.name} which district?`} sub={p.role === "Translator" || p.freeTeach ? "This Teach is free." : "Costs 1 Trust."}>
        <DistrictButtons
          disabled={(d) => p.sight[d] <= t.sight[d]}
          note={(d) => `you ${p.sight[d]} · ${t.name} ${t.sight[d]}`}
          onPick={(d) => setPending({ k: "respond", t, d, card: g.draw(d) })}
        />
        {back}
      </Panel>
    );
  }

  if (pending.k === "respond") {
    const { t, d, card } = pending;
    return (
      <Panel title="Call and response" sub={`${p.name}, read this aloud to ${t.name}. Then ${t.name} says the second number back.`}>
        <blockquote className="rounded-lg border-l-4 border-gold bg-white/5 p-3">
          <p className="font-bold">“{card.front}”</p>
          <p className="mt-2 text-sm">
            <span className="font-black text-[#ff8a8a]">The second number:</span> {card.red}
          </p>
        </blockquote>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={primary} onClick={() => act({ k: "teach", t, d, response: true })}>
            {t.name} said it back (+1 Legend each)
          </button>
          <button className={ghost} onClick={() => act({ k: "teach", t, d, response: false })}>
            Not this time
          </button>
        </div>
      </Panel>
    );
  }

  if (pending.k === "commons")
    return (
      <Panel title="Gather where?" sub="Every place: +2 Trust, −1 Corruption, plus its bonus.">
        <div className="grid gap-2">
          {(Object.keys(C.places) as PlaceKey[]).map((key) => {
            const P = C.places[key];
            const used = key === "KITCHEN" && g.kitchenUsed;
            return (
              <button key={key} className={`${ghost} text-left`} disabled={used} onClick={() => act({ k: "commons", place: key })}>
                <span className="block">{P.name} <span className="text-xs font-normal text-program/70">· {P.where}</span></span>
                <span className="block text-xs font-normal text-gold">{used ? "Grandma already fed the block this game." : P.bonus}</span>
              </button>
            );
          })}
        </div>
        {back}
      </Panel>
    );

  if (pending.k === "reach")
    return (
      <Panel title="Reach a Fallen friend" sub="Costs 2 Trust. They come home at Corruption 4.">
        {g.blk().filter((x) => x.flipped).map((t) => (
          <button key={t.name} className={primary} onClick={() => act({ k: "reach", t })}>
            Reach {t.name}
          </button>
        ))}
        {back}
      </Panel>
    );

  // ---- the menu ----
  const fallen = g.blk().filter((x) => x.flipped);
  const options: { label: string; hint: string; on: () => void; show?: boolean; disabled?: boolean; gold?: boolean }[] = [
    { label: "Study", hint: "+1 Sight in a district" + (p.practice ? " (+2 now)" : ""), on: () => setPending({ k: "pick", for: "study" }) },
    { label: "Face a deal", hint: p.shopAround ? "draw 2, face 1" : "read it, then TAKE / WALK / NEGOTIATE", on: () => setPending({ k: "pick", for: "face" }) },
    { label: "Teach", hint: p.role === "Translator" || p.freeTeach ? "free" : "1 Trust", on: () => setPending({ k: "teachWho" }), disabled: !others.length },
    { label: "Commons", hint: "gather on the West Side", on: () => setPending({ k: "commons" }) },
    { label: "Reach", hint: "2 Trust: bring a Fallen friend home", on: () => setPending({ k: "reach" }), show: fallen.length > 0, disabled: p.trust < 2 },
    { label: "Teach the History", hint: "Elder, once: wake a district", on: () => setPending({ k: "pick", for: "history" }), show: p.role === "Elder" && !p.elderUsed },
    { label: "Trace a thread", hint: "Sight 3 in an awake district", on: () => setPending({ k: "pick", for: "trace" }), show: g.uwOpen, disabled: !DISTRICTS.some((d) => g.canTrace(p, d)) },
    { label: "Sign the League pledge", hint: `${g.league.size}/${g.leagueNeeded()} this round`, on: () => act({ k: "league" }), show: g.hasLeague() && !g.leagueFormed && !g.league.has(p.name) },
    { label: "EXPOSE THE UNDERWORLD", hint: "you win", on: () => act({ k: "expose_uw" }), show: g.canExpose(), gold: true },
  ];
  return (
    <Panel
      title={`${p.name}'s turn`}
      sub={
        <>
          The {p.role}: {C.roles[p.role]} · <b>{s.actionsLeft}</b> action{s.actionsLeft === 1 ? "" : "s"} left
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {options
          .filter((o) => o.show !== false)
          .map((o) => (
            <button key={o.label} className={o.gold ? primary : `${ghost} text-left`} disabled={o.disabled} onClick={o.on}>
              <span className="block">{o.label}</span>
              <span className="block text-xs font-normal text-program/70">{o.hint}</span>
            </button>
          ))}
      </div>
      <button className={`${ghost} w-full`} onClick={() => run((x) => x.endTurn())}>
        End turn (pass the device)
      </button>
    </Panel>
  );
}

/** The Machine moving through a Fallen player, or a person playing the Overlord. */
export function MachinePanel({ s, run, who }: { s: Session; run: Run; who: "fallen" | "overlord" }) {
  const [mode, setMode] = useState<null | "m_extract" | "m_obscure" | "m_tempt">(null);
  const g = s.g;
  const name = who === "fallen" ? s.player.name : g.ov()?.name ?? "The Owner";
  const go = (a: Action) => run((x) => (who === "fallen" ? x.fallenAct(a) : x.overlordAct(a)));
  return (
    <Panel
      title={who === "fallen" ? `The Machine moves through ${name}` : `${name}: the Overlord moves`}
      sub={`${s.movesLeft} move${s.movesLeft === 1 ? "" : "s"} left. One move per district per round: the Machine spreads, it doesn't snipe.`}
    >
      {mode === null && (
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={ghost} onClick={() => setMode("m_extract")}>Extract <span className="block text-xs font-normal">+1 Pressure</span></button>
          <button className={ghost} onClick={() => setMode("m_obscure")}>Obscure <span className="block text-xs font-normal">−1 Clarity</span></button>
          <button className={ghost} onClick={() => setMode("m_tempt")}>Tempt <span className="block text-xs font-normal">−1 Trust</span></button>
          <button className={ghost} onClick={() => go(g.machineAiMove(g.struck))}>Let the Machine choose</button>
        </div>
      )}
      {(mode === "m_extract" || mode === "m_obscure") && (
        <DistrictButtons disabled={(d) => g.struck.has(d)} note={(d) => (g.struck.has(d) ? "already moved here" : `P ${g.pressure[d]} · C ${g.clarity[d]}`)} onPick={(d) => (setMode(null), go({ k: mode, d }))} />
      )}
      {mode === "m_tempt" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {g.active().map((t) => (
            <button key={t.name} className={ghost} disabled={t.trust < 1} onClick={() => (setMode(null), go({ k: "m_tempt", t }))}>
              {t.name} (Trust {t.trust})
            </button>
          ))}
        </div>
      )}
      {mode && (
        <button className={ghost} onClick={() => setMode(null)}>
          Back
        </button>
      )}
    </Panel>
  );
}

export function CookoutPanel({ s, run }: { s: Session; run: Run }) {
  const g = s.g;
  const [picks, setPicks] = useState<Record<string, District>>(() => Object.fromEntries(g.active().map((p) => [p.name, g.cookoutGain(p)[0]])));
  return (
    <Panel title={`Round ${g.round}: call the Cookout?`} sub="Once per game. Nobody takes actions this round. Everyone gets +2 Trust, −1 Corruption, +1 Legend, and catches up to the best reader at the table in one district. The Machine still moves.">
      <div className="space-y-2">
        {g.active().map((p) => (
          <label key={p.name} className="flex items-center justify-between gap-2 text-sm">
            <span>{p.name} catches up in</span>
            <select className="rounded bg-white/10 px-2 py-1" value={picks[p.name]} onChange={(e) => setPicks({ ...picks, [p.name]: e.target.value as District })}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d} className="text-ink">
                  {titleCase(d)} ({p.sight[d]}→{Math.max(...g.active().map((q) => q.sight[d]))})
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={primary} onClick={() => run((x) => x.cookout(true, picks))}>🍖 Call the Cookout</button>
        <button className={ghost} onClick={() => run((x) => x.cookout(false))}>Not this round</button>
      </div>
    </Panel>
  );
}

export function SousouPanel({ s, run }: { s: Session; run: Run }) {
  const g = s.g;
  const payers = g.active().filter((p) => p.trust >= 1).length;
  const pays = s.sousouWouldPay();
  const [d, setD] = useState<District>(() => DISTRICTS.reduce((a, x) => (g.pressure[x] > g.pressure[a] ? x : a), DISTRICTS[0]));
  return (
    <Panel title="The Sou-Sou" sub={`Everyone with Trust puts 1 in the can (${payers} would). At ${K.SOUSOU_HAND}, the next player's hand clears 2 Pressure: no Corruption.`}>
      <p className="text-sm">
        Pot {g.pot}/{K.SOUSOU_HAND} · next hand: <b>{g.nextHand()?.name}</b>
        {pays ? " · this throw pays out!" : ""}
      </p>
      {pays && (
        <label className="flex items-center justify-between gap-2 text-sm">
          <span>{g.nextHand()?.name} pays off the debt in</span>
          <select className="rounded bg-white/10 px-2 py-1" value={d} onChange={(e) => setD(e.target.value as District)}>
            {DISTRICTS.map((x) => (
              <option key={x} value={x} className="text-ink">
                {titleCase(x)} (Pressure {g.pressure[x]})
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={primary} onClick={() => run((x) => x.sousou(true, d))}>Throw a hand</button>
        <button className={ghost} onClick={() => run((x) => x.sousou(false))}>Not this round</button>
      </div>
    </Panel>
  );
}

export function MachineReport({ s, run }: { s: Session; run: Run }) {
  const lines = s.g.log.slice(s.stepStart);
  return (
    <Panel title="The Machine moves" sub="Here's what happened while the block was gathering itself.">
      <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">
        {lines.map((l, i) => (
          <li key={i} className={l.startsWith("  ") ? "pl-3 text-program/90" : "font-semibold"}>
            {l.trim()}
          </li>
        ))}
      </ul>
      <button className={primary} onClick={() => run((x) => x.nextRound())}>
        Start round {s.g.round + 1}
      </button>
    </Panel>
  );
}
