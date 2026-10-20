"use client";
import { useState, type ReactNode } from "react";
import { C, K, type Card, type Choice, type District, type PlaceKey } from "../engine/content";
import { maxBy, type Action, type Player } from "../engine/engine";
import { adviseCookout, adviseDeal, adviseSousou, adviseTurn } from "../game/coach";
import { toWire, type WireAction } from "../game/moves";
import type { Session } from "../game/session";
import { CoachBadge, CoachBox, picked, safe, ShortcutBadge } from "./Coach";
import { Icon, type IconName } from "./icons";
import { DealCard } from "./DealCard";
import { clockTag, SignNowClock, useSignNow } from "./SignNowClock";
import { DISTRICT_COLOR, titleCase } from "./theme";
import type { Local, Play } from "./useSession";

/** where the player is in the turn menu (this device only; drawn cards live in the session) */
type Pending =
  | { k: "menu" }
  | { k: "pick"; for: "study" | "face" | "history" | "trace" }
  | { k: "teachWho" }
  | { k: "teachWhere"; t: Player }
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

function DistrictButtons({ ds, onPick, disabled, note, best }: { ds: District[]; onPick: (d: District) => void; disabled?: (d: District) => boolean; note?: (d: District) => string; best?: District }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ds.map((d) => (
        <button key={d} className={`${btn} text-white${picked(d === best)}`} style={{ background: DISTRICT_COLOR[d] }} disabled={disabled?.(d)} onClick={() => onPick(d)}>
          <span>{titleCase(d)}</span>
          {note && <span className="block text-[10px] font-normal opacity-90">{note(d)}</span>}
          {d === best && <CoachBadge />}
        </button>
      ))}
    </div>
  );
}

const formId = (s: Session, d: District, card: Card) =>
  s.g.deck[d].includes(card)
    ? `${d.slice(0, 3)}-${String(s.g.deck[d].indexOf(card) + 1).padStart(2, "0")}`
    : card.counterfeit // a counterfeit carries a real-looking form number: "NEW" would give it away
      ? `${d.slice(0, 3)}-${String(s.g.deck[d].length + 1).padStart(2, "0")}`
      : `${d.slice(0, 3)}-NEW`;

/** The current player's turn. Keyed by the parent per action, so its local state resets. */
export function TurnPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const [pending, setPending] = useState<Pending>({ k: "menu" });
  /** after shopping around: which of the two deals this player chose to face */
  const [chosen, setChosen] = useState<Card | null>(null);
  const g = s.g;
  const p = s.player;
  const others = g.active().filter((x) => x !== p);
  const back = (
    <button className={ghost} onClick={() => setPending({ k: "menu" })}>
      Back
    </button>
  );
  const act = (a: Action) => play({ t: "act", a: toWire(g, a) });
  const run = local;
  const tip = s.coach ? safe(() => adviseTurn(g, p, s.actionsLeft)) : null;
  const pick = tip?.pick;
  const dealTip = (d: District, card: Card) => {
    if (!s.coach) return null;
    // the Coach only knows what this player can read: below Read 3, a counterfeit looks honest to it too
    const tip = safe(() => adviseDeal(g, p, d, g.looks(p, d, card)));
    // the math variant: don't give away the second number before the table has worked it out
    if (tip && s.config.math && card.answer !== undefined && p.sight[d] >= 1)
      return { ...tip, title: "Work it out first", why: "Work out the second number on the card and check it. Then read the red layer: it tells you whether this is a trap. My pick is lit up if you want it." };
    return tip;
  };

  const pd = s.pending;
  const dealCard = pd?.k === "deal" ? (pd.cards.length === 1 ? pd.cards[0] : chosen) : null;
  if (pd?.k === "deal" && !dealCard) {
    const rank = (c: Card) => ({ NEGOTIATE: 3, TAKE: 2, WALK: 1 })[dealTip(pd.d, c)?.pick ?? "WALK"];
    const best = s.coach ? maxBy(pd.cards, rank) : null;
    const bestTip = best && dealTip(pd.d, best);
    return (
      <Panel key="choose" title="You shopped around: two deals" sub="Read both, then face one.">
        <CoachBox s={s} run={run} view="deal" sight={p.sight[pd.d]} advice={bestTip && { title: `Face deal ${pd.cards.indexOf(best!) + 1}, then ${bestTip.pick}`, why: bestTip.why }} />
        <div className="grid gap-4 md:grid-cols-2">
          {pd.cards.map((card, i) => (
            <div key={i} className="space-y-2">
              <DealCard card={g.looks(p, pd.d, card)} district={pd.d} sub={g.ed.districts[pd.d].sub} sight={p.sight[pd.d]} effectiveLever={g.lever(pd.d, g.looks(p, pd.d, card))} formId={formId(s, pd.d, card)} math={s.config.math} />
              <button className={primary + picked(card === best)} onClick={() => setChosen(card)}>
                <span>Face this deal</span>
                {card === best && <CoachBadge />}
              </button>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (pd?.k === "deal" && dealCard)
    return <FaceDeal key={g.dealt.indexOf(dealCard)} s={s} play={play} run={run} d={pd.d} card={dealCard} deal={dealTip(pd.d, dealCard)} />;

  if (pd?.k === "teach") {
    const t = g.players.find((x) => x.name === pd.to)!;
    const { d, card } = pd;
    return (
      <Panel key="respond" title="Call and response" sub={`${p.name}, read this aloud to ${t.name}. Then ${t.name} says the second number back.`}>
        <blockquote className="rounded-lg border-l-4 border-gold bg-white/5 p-3">
          <p className="font-bold">“{card.front}”</p>
          <p className="mt-2 text-sm">
            <span className="font-black text-[#ff8a8a]">The second number:</span> {card.red}
          </p>
        </blockquote>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={primary + picked(s.coach)} onClick={() => act({ k: "teach", t, d, response: true })}>
            <span>{t.name} said it back (+1 Props each)</span>
            {s.coach && <CoachBadge />}
          </button>
          <button className={ghost} onClick={() => act({ k: "teach", t, d, response: false })}>
            Not this time
          </button>
        </div>
      </Panel>
    );
  }

  if (pending.k === "pick") {
    const f = pending.for;
    const title = { study: "Study which district?", face: "Face a deal where?", history: "Teach the History of…", trace: "Trace the thread under…" }[f];
    return (
      <Panel key={pending.k} title={title}>
        <CoachBox s={s} run={run} advice={pick?.k === f ? tip : null} />
        <DistrictButtons ds={g.ds}
          best={pick?.k === f ? pick.d : undefined}
          disabled={(d) => (f === "study" ? p.sight[d] >= 3 : f === "trace" ? !g.canTrace(p, d) : false)}
          note={(d) => (f === "history" ? `wakes ${titleCase(d)}` : `your Read ${p.sight[d]}`)}
          onPick={(d) => {
            if (f === "study") act({ k: "study", d });
            else if (f === "trace") act({ k: "trace", d });
            else if (f === "history") act({ k: "history", d });
            else play({ t: "deal", d });
          }}
        />
        {f !== "face" && back}
      </Panel>
    );
  }

  if (pending.k === "teachWho")
    return (
      <Panel key={pending.k} title="Teach whom?" sub="You can only teach a district you read better than they do.">
        <CoachBox s={s} run={run} advice={pick?.k === "teach" ? tip : null} />
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((t) => (
            <button key={t.name} className={ghost + picked(pick?.k === "teach" && pick.t === t.name)} disabled={!g.ds.some((d) => p.sight[d] > t.sight[d])} onClick={() => setPending({ k: "teachWhere", t })}>
              <span>{t.name} </span>
              <span className="text-xs font-normal">the {t.role}</span>
              {pick?.k === "teach" && pick.t === t.name && <CoachBadge />}
            </button>
          ))}
        </div>
        {back}
      </Panel>
    );

  if (pending.k === "teachWhere") {
    const t = pending.t;
    return (
      <Panel key={pending.k} title={`Teach ${t.name} which district?`} sub={p.role === "Translator" || p.freeTeach ? "This Teach is free." : "Costs 1 Trust."}>
        <DistrictButtons ds={g.ds}
          best={pick?.k === "teach" && pick.t === t.name ? pick.d : undefined}
          disabled={(d) => p.sight[d] <= t.sight[d]}
          note={(d) => `you ${p.sight[d]} · ${t.name} ${t.sight[d]}`}
          onPick={(d) => play({ t: "teachCard", to: t.name, d })}
        />
        {back}
      </Panel>
    );
  }

  if (pending.k === "commons") {
    const best = pick?.k === "commons" ? pick.place : s.coach ? g.botPlace(p) : null;
    return (
      <Panel key={pending.k} title="Gather where?" sub="Every place: +2 Trust, −1 Shady, plus its bonus.">
        <CoachBox s={s} run={run} advice={pick?.k === "commons" ? tip : null} />
        <div className="grid gap-2">
          {(Object.keys(g.places) as PlaceKey[]).map((key) => {
            const P = g.places[key];
            const used = key === "KITCHEN" && g.kitchenUsed;
            return (
              <button key={key} className={`${ghost} text-left${picked(key === best && !used)}`} disabled={used} onClick={() => act({ k: "commons", place: key })}>
                <span className="block">{P.name} <span className="text-xs font-normal text-program/70">· {P.where}</span></span>
                <span className="block text-xs font-normal text-gold">{used ? "Grandma already fed the block this game." : P.bonus}</span>
                {key === best && !used && <CoachBadge />}
              </button>
            );
          })}
        </div>
        {back}
      </Panel>
    );
  }

  if (pending.k === "reach")
    return (
      <Panel key={pending.k} title="Reach a Fallen friend" sub="Costs 2 Trust. They come home at Shady 4.">
        {g.blk().filter((x) => x.flipped).map((t) => (
          <button key={t.name} className={primary + picked(pick?.k === "reach" && pick.t === t.name)} onClick={() => act({ k: "reach", t })}>
            <span>Reach {t.name}</span>
            {pick?.k === "reach" && pick.t === t.name && <CoachBadge />}
          </button>
        ))}
        {back}
      </Panel>
    );

  // ---- the menu ----
  const fallen = g.blk().filter((x) => x.flipped);
  const options: { kind: string; icon: IconName; label: string; hint: string; on: () => void; show?: boolean; disabled?: boolean; gold?: boolean }[] = [
    { kind: "study", icon: "sight", label: "Study", hint: "+1 Read in a district" + (p.practice ? " (+2 now)" : ""), on: () => setPending({ k: "pick", for: "study" }) },
    { kind: "face", icon: "deal", label: "Face a deal", hint: p.shopAround ? "draw 2, face 1" : "read it, then TAKE / WALK / NEGOTIATE", on: () => setPending({ k: "pick", for: "face" }) },
    { kind: "teach", icon: "teach", label: "Teach", hint: p.role === "Translator" || p.freeTeach ? "free" : "1 Trust", on: () => setPending({ k: "teachWho" }), disabled: !others.length },
    g.party
      ? { kind: "commons", icon: "commons", label: "Gather", hint: "+2 Trust, −1 Shady", on: () => act({ k: "commons", place: "BARBERSHOP" }) }
      : { kind: "commons", icon: "commons", label: "Commons", hint: `gather on ${g.ed.area}`, on: () => setPending({ k: "commons" }) },
    { kind: "reach", icon: "reach", label: "Reach", hint: "2 Trust: bring a Fallen friend home", on: () => setPending({ k: "reach" }), show: fallen.length > 0, disabled: p.trust < 2 },
    { kind: "history", icon: "history", label: "Teach the History", hint: "Elder, once: wake a district", on: () => setPending({ k: "pick", for: "history" }), show: p.role === "Elder" && !p.elderUsed },
    { kind: "trace", icon: "clue", label: "Trace a thread", hint: "Read 3 in an awake district", on: () => setPending({ k: "pick", for: "trace" }), show: g.uwOpen, disabled: !g.ds.some((d) => g.canTrace(p, d)) },
    { kind: "league", icon: "league", label: "Sign the League pledge", hint: `${g.league.size}/${g.leagueNeeded()} this round`, on: () => act({ k: "league" }), show: g.hasLeague() && !g.leagueFormed && !g.league.has(p.name) },
    { kind: "expose_uw", icon: "expose", label: "EXPOSE THE UNDERWORLD", hint: "you win", on: () => act({ k: "expose_uw" }), show: g.canExpose(), gold: true },
  ];
  return (
    <Panel
      key={pending.k}
      title={`${p.name}'s turn`}
      sub={
        <>
          The {p.role}: {C.roles[p.role] ?? "a neighbor on the block"} · <b>{s.actionsLeft}</b> action{s.actionsLeft === 1 ? "" : "s"} left
        </>
      }
    >
      <CoachBox s={s} run={run} advice={tip} />
      <div className="grid gap-2 sm:grid-cols-2">
        {options
          .filter((o) => o.show !== false)
          .map((o) => (
            <button key={o.label} className={(o.gold ? primary : `${ghost} text-left`) + picked(pick?.k === o.kind)} disabled={o.disabled} onClick={o.on}>
              <span className="flex items-center gap-1.5">
                <Icon name={o.icon} size={16} color={o.gold ? "#1B1530" : "#F2B632"} />
                {o.label}
              </span>
              <span className="block text-xs font-normal text-program/70">{o.hint}</span>
              {pick?.k === o.kind && <CoachBadge />}
            </button>
          ))}
      </div>
      <button className={`${ghost} w-full`} onClick={() => play({ t: "end" })}>
        End turn (pass the device)
      </button>
    </Panel>
  );
}

/** Facing one deal: read it, then TAKE / WALK / NEGOTIATE. A "sign now" deal counts down while you decide. */
function FaceDeal({ s, play, run, d, card, deal }: { s: Session; play: Play; run: Local; d: District; card: Card; deal: ReturnType<typeof adviseDeal> | null }) {
  const g = s.g;
  const p = s.player;
  const cost = g.negCost(d);
  const [clock, left] = useSignNow(!!card.rush, p.sight[d], s.config.clocks !== false);
  const decide = (c: Choice) => {
    const tag = clockTag(clock);
    play({ t: "act", a: { ...toWire(g, { k: "face", d, choice: c, card }), ...(tag ? { clock: tag } : {}) } as WireAction });
  };
  const choice = (c: Choice, label: string) => (
    <button
      className={primary + picked(deal?.pick === c) + (c === "TAKE" && clock === "running" ? " urge ring-2 ring-[#E63946]" : "")}
      disabled={c === "NEGOTIATE" && p.trust < cost}
      onClick={() => decide(c)}
    >
      <span>{c === "TAKE" && clock === "running" ? "SIGN NOW" : c}</span>
      <span className="block text-[11px] font-normal">{label}</span>
      {deal?.pick === c && <CoachBadge />}
      {deal?.alt?.pick === c && <ShortcutBadge falls={deal.alt.falls} />}
    </button>
  );
  return (
    <Panel key="face" title={`${p.name} faces a deal in ${titleCase(d)}`} sub="Read what you can, then decide.">
      <CoachBox s={s} run={run} view="deal" sight={p.sight[d]} advice={deal} />
      <SignNowClock state={clock} left={left} />
      <DealCard card={g.looks(p, d, card)} district={d} sub={g.ed.districts[d].sub} sight={p.sight[d]} effectiveLever={g.lever(d, g.looks(p, d, card))} formId={formId(s, d, card)} math={s.config.math} />
      <div className="grid gap-2 sm:grid-cols-3">
        {choice("TAKE", "accept it")}
        {choice("WALK", "refuse it")}
        {choice("NEGOTIATE", `${cost} Trust · beats a trap if Read ≥ lever`)}
      </div>
    </Panel>
  );
}

/** The Machine moving through a Fallen player, or a person playing the Overlord. */
export function MachinePanel({ s, play, local, who }: { s: Session; play: Play; local: Local; who: "fallen" | "overlord" }) {
  const [mode, setMode] = useState<null | "m_extract" | "m_obscure" | "m_tempt" | "m_counterfeit">(null);
  const g = s.g;
  const name = who === "fallen" ? s.player.name : g.ov()?.name ?? "The Owner";
  const go = (a: Action) => play({ t: who, a: toWire(g, a) });
  return (
    <Panel
      title={who === "fallen" ? `The Machine moves through ${name}` : `${name}: the Overlord moves`}
      sub={`${s.movesLeft} move${s.movesLeft === 1 ? "" : "s"} left. One move per district per round: the Machine spreads, it doesn't snipe.`}
    >
      {who === "fallen" && <CoachBox s={s} run={local} />}
      {mode === null && (
        <div key="menu" className="grid gap-2 sm:grid-cols-2">
          <button className={ghost} onClick={() => setMode("m_extract")}>Strike <span className="block text-xs font-normal">+1 Squeeze</span></button>
          <button className={ghost} onClick={() => setMode("m_obscure")}>Muddy <span className="block text-xs font-normal">−1 Clarity</span></button>
          <button className={ghost} onClick={() => setMode("m_tempt")}>Tempt <span className="block text-xs font-normal">−1 Trust</span></button>
          {who === "overlord" && (
            <button className={ghost} disabled={!g.canCounterfeit()} onClick={() => setMode("m_counterfeit")}>
              Counterfeit{" "}
              <span className="block text-xs font-normal">
                {g.forged ? "one a round: done" : `a fake honest deal in a pile · ${g.forgeries} left`}
              </span>
            </button>
          )}
          <button className={ghost} onClick={() => go(who === "overlord" ? g.overlordAiMove(g.struck) : g.machineAiMove(g.struck))}>Let the Machine choose</button>
        </div>
      )}
      {who === "overlord" && g.counterfeits.size > 0 && (
        <p className="text-xs text-[#c9a2ff]">Your counterfeits wait in: {[...g.counterfeits].map(titleCase).join(", ")}. Only Read 3 sees them. Keep it off the table&apos;s screens.</p>
      )}
      {mode === "m_counterfeit" && (
        <DistrictButtons
          ds={g.ds}
          disabled={(d) => g.counterfeits.has(d)}
          note={(d) => (g.counterfeits.has(d) ? "one waiting here" : `${g.active().filter((x) => x.sight[d] >= 3).length} can read blue here`)}
          onPick={(d) => (setMode(null), go({ k: "m_counterfeit", d }))}
        />
      )}
      {(mode === "m_extract" || mode === "m_obscure") && (
        <DistrictButtons ds={g.ds} disabled={(d) => g.struck.has(d)} note={(d) => (g.struck.has(d) ? "already moved here" : `Squeeze ${g.pressure[d]} · Clarity ${g.clarity[d]}`)} onPick={(d) => (setMode(null), go({ k: mode, d }))} />
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

export function CookoutPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const g = s.g;
  const [picks, setPicks] = useState<Record<string, District>>(() => Object.fromEntries(g.active().map((p) => [p.name, g.cookoutGain(p)[0]])));
  const tip = s.coach ? safe(() => adviseCookout(g)) : null;
  return (
    <Panel title={`Round ${g.round}: call the Cookout?`} sub="Once per game. Nobody takes actions this round. Everyone gets +2 Trust, −1 Shady, +1 Props, and catches up to the best reader at the table in one district. The Machine still moves.">
      <CoachBox s={s} run={local} advice={tip} />
      <div className="space-y-2">
        {g.active().map((p) => (
          <label key={p.name} className="flex items-center justify-between gap-2 text-sm">
            <span>{p.name} catches up in</span>
            <select className="rounded bg-white/10 px-2 py-1" value={picks[p.name]} onChange={(e) => setPicks({ ...picks, [p.name]: e.target.value as District })}>
              {g.ds.map((d) => (
                <option key={d} value={d} className="text-ink">
                  {titleCase(d)} ({p.sight[d]}→{Math.max(...g.active().map((q) => q.sight[d]))})
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={primary + picked(tip?.pick === true)} onClick={() => play({ t: "cookout", call: true, picks })}>
          <span>🍖 Call the Cookout</span>
          {tip?.pick === true && <CoachBadge />}
        </button>
        <button className={ghost + picked(tip?.pick === false)} onClick={() => play({ t: "cookout", call: false })}>
          <span>Not this round</span>
          {tip?.pick === false && <CoachBadge />}
        </button>
      </div>
    </Panel>
  );
}

export function SousouPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const g = s.g;
  const payers = g.active().filter((p) => p.trust >= 1).length;
  const pays = s.sousouWouldPay();
  const [d, setD] = useState<District>(() => g.ds.reduce((a, x) => (g.pressure[x] > g.pressure[a] ? x : a), g.ds[0]));
  const tip = s.coach ? safe(() => adviseSousou(s)) : null;
  return (
    <Panel title="The Sou-Sou" sub={`Everyone with Trust puts 1 in the can (${payers} would). At ${K.SOUSOU_HAND}, the next player's hand clears 2 Squeeze: no Shady.`}>
      <CoachBox s={s} run={local} advice={tip} />
      <p className="text-sm">
        Pot {g.pot}/{K.SOUSOU_HAND} · next hand: <b>{g.nextHand()?.name}</b>
        {pays ? " · this throw pays out!" : ""}
      </p>
      {pays && (
        <label className="flex items-center justify-between gap-2 text-sm">
          <span>{g.nextHand()?.name} pays off the debt in</span>
          <select className="rounded bg-white/10 px-2 py-1" value={d} onChange={(e) => setD(e.target.value as District)}>
            {g.ds.map((x) => (
              <option key={x} value={x} className="text-ink">
                {titleCase(x)} (Squeeze {g.pressure[x]})
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={primary + picked(tip?.pick === true)} onClick={() => play({ t: "sousou", hand: true, d })}>
          <span>Throw a hand</span>
          {tip?.pick === true && <CoachBadge />}
        </button>
        <button className={ghost + picked(tip?.pick === false)} onClick={() => play({ t: "sousou", hand: false })}>
          <span>Not this round</span>
          {tip?.pick === false && <CoachBadge />}
        </button>
      </div>
    </Panel>
  );
}

export function MachineReport({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const lines = s.g.log.slice(s.stepStart);
  return (
    <Panel title="The Machine moves" sub="Here's what happened while the block was gathering itself.">
      <CoachBox s={s} run={local} />
      <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">
        {lines.map((l, i) => (
          <li key={i} className={l.startsWith("  ") ? "pl-3 text-program/90" : "font-semibold"}>
            {l.trim()}
          </li>
        ))}
      </ul>
      <button className={primary} onClick={() => play({ t: "next" })}>
        Start round {s.g.round + 1}
      </button>
    </Panel>
  );
}
