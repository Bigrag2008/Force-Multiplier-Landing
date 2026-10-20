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
import { DISTRICT_SURFACE, DISTRICT_MARK, titleCase } from "./theme";
import { t, tCard, useLang } from "../i18n";
import { tLog } from "../i18n/log";
import type { Local, Play } from "./useSession";

/** where the player is in the turn menu (this device only; drawn cards live in the session) */
type Pending =
  | { k: "menu" }
  | { k: "pick"; for: "study" | "face" | "history" | "trace" | "neighbor" }
  | { k: "teachWho" }
  | { k: "teachWhere"; t: Player }
  | { k: "commons" }
  | { k: "reach" };

const btn = "rounded-lg px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40";
const primary = `${btn} bg-gold text-night hover:brightness-110`;
const ghost = `${btn} border border-white/25 text-program hover:bg-white/10`;

function Panel({ title, children, sub }: { title: ReactNode; sub?: ReactNode; children: ReactNode }) {
  useLang();
  return (
    <section className="rounded-xl border border-gold/40 bg-night/80 p-4 shadow-lg">
      <h2 className="text-lg font-black text-gold">{title}</h2>
      {sub && <div className="mt-0.5 text-sm text-program/80">{sub}</div>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function DistrictButtons({ ds, onPick, disabled, note, best }: { ds: District[]; onPick: (d: District) => void; disabled?: (d: District) => boolean; note?: (d: District) => string; best?: District }) {
  useLang();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ds.map((d) => (
        <button key={d} className={`${btn}${picked(d === best)}`} style={{ background: DISTRICT_SURFACE[d].bg, color: DISTRICT_SURFACE[d].fg }} disabled={disabled?.(d)} onClick={() => onPick(d)}>
          <span><span aria-hidden>{DISTRICT_MARK[d]} </span>{titleCase(d)}</span>
          {note && <span className="block text-[10px] font-normal opacity-90">{note(d)}</span>}
          {d === best && <CoachBadge />}
        </button>
      ))}
    </div>
  );
}

/** the engine's reason the Throne can't be taken yet, in the current language (display only) */
function throneWords(why: string) {
  let m: RegExpMatchArray | null;
  if ((m = why.match(/^everyone has to teach first \((.+) hasn't\)$/))) return t("everyone has to teach first ({names} hasn't)", { names: m[1] });
  if ((m = why.match(/^(.+) holds more than half the table's Props: no neck for a crown$/))) return t("{name} holds more than half the table's Props: no neck for a crown", { name: m[1] });
  return t(why);
}

const formId = (s: Session, d: District, card: Card) =>
  s.g.deck[d].includes(card)
    ? `${d.slice(0, 3)}-${String(s.g.deck[d].indexOf(card) + 1).padStart(2, "0")}`
    : card.counterfeit // a counterfeit carries a real-looking form number: "NEW" would give it away
      ? `${d.slice(0, 3)}-${String(s.g.deck[d].length + 1).padStart(2, "0")}`
      : `${d.slice(0, 3)}-NEW`;

/** The current player's turn. Keyed by the parent per action, so its local state resets. */
export function TurnPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  useLang();
  const [pending, setPending] = useState<Pending>({ k: "menu" });
  /** after shopping around: which of the two deals this player chose to face */
  const [chosen, setChosen] = useState<Card | null>(null);
  const g = s.g;
  const p = s.player;
  const others = g.active().filter((x) => x !== p);
  const back = (
    <button className={ghost} onClick={() => setPending({ k: "menu" })}>
      {t("Back")}
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
      return { ...tip, title: t("Work it out first"), why: t("Work out the second number on the card and check it. Then read the red layer: it tells you whether this is a trap. My pick is lit up if you want it.") };
    return tip;
  };

  const pd = s.pending;
  const dealCard = pd?.k === "deal" ? (pd.cards.length === 1 ? pd.cards[0] : chosen) : null;
  if (pd?.k === "deal" && !dealCard) {
    const rank = (c: Card) => ({ NEGOTIATE: 3, TAKE: 2, WALK: 1 })[dealTip(pd.d, c)?.pick ?? "WALK"];
    const best = s.coach ? maxBy(pd.cards, rank) : null;
    const bestTip = best && dealTip(pd.d, best);
    return (
      <Panel key="choose" title={t("You shopped around: two deals")} sub={t("Read both, then face one.")}>
        <CoachBox s={s} run={run} view="deal" sight={p.sight[pd.d]} advice={bestTip && { title: t("Face deal {n}, then {pick}", { n: pd.cards.indexOf(best!) + 1, pick: t(bestTip.pick) }), why: bestTip.why }} />
        <div className="grid gap-4 md:grid-cols-2">
          {pd.cards.map((card, i) => (
            <div key={i} className="space-y-2">
              <DealCard card={g.looks(p, pd.d, card)} district={pd.d} sub={t(g.ed.districts[pd.d].sub)} sight={p.sight[pd.d]} effectiveLever={g.lever(pd.d, g.looks(p, pd.d, card))} formId={formId(s, pd.d, card)} math={s.config.math} />
              <button className={primary + picked(card === best)} onClick={() => setChosen(card)}>
                <span>{t("Face this deal")}</span>
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
    const to = g.players.find((x) => x.name === pd.to)!;
    const { d, card } = pd;
    const shownCard = tCard(card);
    return (
      <Panel key="respond" title={t("Call and response")} sub={t("{name}, read this aloud to {to}. Then {to} says the second number back.", { name: p.name, to: to.name })}>
        <blockquote className="rounded-lg border-l-4 border-gold bg-white/5 p-3">
          <p className="font-bold">“{shownCard.front}”</p>
          <p className="mt-2 text-sm">
            <span className="font-black text-[#ff8a8a]">{t("The second number:")}</span> {shownCard.red}
          </p>
        </blockquote>
        <div className="grid gap-2 sm:grid-cols-2">
          <button className={primary + picked(s.coach)} onClick={() => act({ k: "teach", t: to, d, response: true })}>
            <span>{t("{name} said it back (+1 Props each)", { name: to.name })}</span>
            {s.coach && <CoachBadge />}
          </button>
          <button className={ghost} onClick={() => act({ k: "teach", t: to, d, response: false })}>
            {t("Not this time")}
          </button>
        </div>
      </Panel>
    );
  }

  if (pending.k === "pick") {
    const f = pending.for;
    const title = t({ study: "Study which district?", face: "Face a deal where?", history: "Teach the History of…", trace: "Trace the thread under…", neighbor: "Teach a neighbor to read…" }[f]);
    return (
      <Panel key={pending.k} title={title}>
        <CoachBox s={s} run={run} advice={pick?.k === f ? tip : null} />
        <DistrictButtons ds={g.ds}
          best={pick?.k === f ? pick.d : undefined}
          disabled={(d) => (f === "study" ? p.sight[d] >= 3 : f === "trace" ? !g.canTrace(p, d) : f === "neighbor" ? p.sight[d] < 1 || g.clarity[d] >= K.WAKE : false)}
          note={(d) => (f === "history" ? t("wakes {d}", { d: titleCase(d) }) : f === "neighbor" ? t("Clarity {a}→{b}", { a: g.clarity[d], b: Math.min(K.WAKE, g.clarity[d] + K.SOLO_NEIGHBOR) }) : t("your Read {n}", { n: p.sight[d] }))}
          onPick={(d) => {
            if (f === "study") act({ k: "study", d });
            else if (f === "trace") act({ k: "trace", d });
            else if (f === "history") act({ k: "history", d });
            else if (f === "neighbor") act({ k: "neighbor", d });
            else play({ t: "deal", d });
          }}
        />
        {f !== "face" && back}
      </Panel>
    );
  }

  if (pending.k === "teachWho")
    return (
      <Panel key={pending.k} title={t("Teach whom?")} sub={t("You can only teach a district you read better than they do.")}>
        <CoachBox s={s} run={run} advice={pick?.k === "teach" ? tip : null} />
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((o) => (
            <button key={o.name} className={ghost + picked(pick?.k === "teach" && pick.t === o.name)} disabled={!g.ds.some((d) => p.sight[d] > o.sight[d])} onClick={() => setPending({ k: "teachWhere", t: o })}>
              <span>{o.name} </span>
              <span className="text-xs font-normal">{t("the {role}", { role: t(o.role) })}</span>
              {pick?.k === "teach" && pick.t === o.name && <CoachBadge />}
            </button>
          ))}
        </div>
        {back}
      </Panel>
    );

  if (pending.k === "teachWhere") {
    const to = pending.t;
    return (
      <Panel key={pending.k} title={t("Teach {name} which district?", { name: to.name })} sub={p.role === "Translator" || p.freeTeach ? t("This Teach is free.") : t("Costs 1 Trust.")}>
        <DistrictButtons ds={g.ds}
          best={pick?.k === "teach" && pick.t === to.name ? pick.d : undefined}
          disabled={(d) => p.sight[d] <= to.sight[d]}
          note={(d) => t("you {a} · {name} {b}", { a: p.sight[d], name: to.name, b: to.sight[d] })}
          onPick={(d) => play({ t: "teachCard", to: to.name, d })}
        />
        {back}
      </Panel>
    );
  }

  if (pending.k === "commons") {
    const best = pick?.k === "commons" ? pick.place : s.coach ? g.botPlace(p) : null;
    return (
      <Panel key={pending.k} title={t("Gather where?")} sub={t("Every place: +2 Trust, −1 Shady, plus its bonus.")}>
        <CoachBox s={s} run={run} advice={pick?.k === "commons" ? tip : null} />
        <div className="grid gap-2">
          {(Object.keys(g.places) as PlaceKey[]).map((key) => {
            const P = g.places[key];
            const used = key === "KITCHEN" && g.kitchenUsed;
            return (
              <button key={key} className={`${ghost} text-left${picked(key === best && !used)}`} disabled={used} onClick={() => act({ k: "commons", place: key })}>
                <span className="block">{t(P.name)} <span className="text-xs font-normal text-program/70">· {t(P.where)}</span></span>
                <span className="block text-xs font-normal text-gold">{used ? t("Grandma already fed the block this game.") : t(P.bonus)}</span>
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
      <Panel key={pending.k} title={t("Reach a Fallen friend")} sub={t("Costs 2 Trust. They come home at Shady 4.")}>
        {g.blk().filter((x) => x.flipped).map((f) => (
          <button key={f.name} className={primary + picked(pick?.k === "reach" && pick.t === f.name)} onClick={() => act({ k: "reach", t: f })}>
            <span>{t("Reach {name}", { name: f.name })}</span>
            {pick?.k === "reach" && pick.t === f.name && <CoachBadge />}
          </button>
        ))}
        {back}
      </Panel>
    );

  // ---- the menu ----
  const fallen = g.blk().filter((x) => x.flipped);
  const atDesk = g.desk === p.name;
  const throne = g.uwOpen && g.threads.size >= g.threadsNeeded() ? g.throneBlocks() : null;
  const options: { kind: string; icon: IconName; label: string; hint: string; on: () => void; show?: boolean; disabled?: boolean; gold?: boolean }[] = [
    { kind: "study", icon: "sight", label: "Study", hint: p.practice ? t("+1 Read in a district (+2 now)") : t("+1 Read in a district"), on: () => setPending({ k: "pick", for: "study" }) },
    { kind: "face", icon: "deal", label: "Face a deal", hint: atDesk ? t("not while you're at the Desk") : p.shopAround ? t("draw 2, face 1") : t("read it, then TAKE / WALK / NEGOTIATE"), on: () => setPending({ k: "pick", for: "face" }), disabled: atDesk },
    g.solo()
      ? { kind: "neighbor", icon: "teach", label: "Teach a neighbor", hint: p.role === "Translator" || p.freeTeach ? t("free: +1 Clarity where you read") : t("1 Trust: +1 Clarity where you read"), on: () => setPending({ k: "pick", for: "neighbor" }), disabled: !g.ds.some((d) => p.sight[d] >= 1 && g.clarity[d] < K.WAKE) }
      : { kind: "teach", icon: "teach", label: "Teach", hint: atDesk ? t("not while you're at the Desk") : p.role === "Translator" || p.freeTeach ? t("free") : t("1 Trust"), on: () => setPending({ k: "teachWho" }), disabled: !others.length || atDesk },
    g.party
      ? { kind: "commons", icon: "commons", label: "Gather", hint: t("+2 Trust, −1 Shady"), on: () => act({ k: "commons", place: "BARBERSHOP" }) }
      : { kind: "commons", icon: "commons", label: "Commons", hint: t("gather on {area}", { area: t(g.ed.area) }), on: () => setPending({ k: "commons" }) },
    { kind: "reach", icon: "reach", label: "Reach", hint: t("2 Trust: bring a Fallen friend home"), on: () => setPending({ k: "reach" }), show: fallen.length > 0, disabled: p.trust < 2 },
    { kind: "history", icon: "history", label: "Teach the History", hint: t("Elder, once: wake a district"), on: () => setPending({ k: "pick", for: "history" }), show: p.role === "Elder" && !p.elderUsed },
    { kind: "trace", icon: "clue", label: "Trace a thread", hint: t("Read 3 in an awake district"), on: () => setPending({ k: "pick", for: "trace" }), show: g.uwOpen, disabled: !g.ds.some((d) => g.canTrace(p, d)) },
    { kind: "league", icon: "league", label: "Sign the League pledge", hint: t("{a}/{b} this round", { a: g.league.size, b: g.leagueNeeded() }), on: () => act({ k: "league" }), show: g.hasLeague() && !g.leagueFormed && !g.league.has(p.name) },
    { kind: "march", icon: "league", label: "Call the March", hint: t("once a game: everyone +2 Trust, −1 Shady, covered"), on: () => act({ k: "march" }), show: g.canMarch() },
    { kind: "leave_desk", icon: "door", label: "Quit the Desk", hint: t("for good: face deals and teach again"), on: () => act({ k: "leave_desk" }), show: atDesk },
    { kind: "expose_uw", icon: "expose", label: "EXPOSE THE UNDERWORLD", hint: t("you win"), on: () => act({ k: "expose_uw" }), show: g.canExpose(), gold: true },
    { kind: "throne", icon: "expose", label: "No neck for a crown", hint: t("You can't Expose yet: {why}.", { why: throneWords(throne ?? "") }), on: () => undefined, show: !!throne, disabled: true },
  ];
  return (
    <Panel
      key={pending.k}
      title={t("{name}'s turn", { name: p.name })}
      sub={
        <>
          {t("The {role}", { role: t(p.role) })}: {C.roles[p.role] ? t(C.roles[p.role]) : t("a neighbor on the block")} · {s.actionsLeft === 1 ? t("1 action left") : t("{n} actions left", { n: s.actionsLeft })}
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
                {t(o.label)}
              </span>
              <span className="block text-xs font-normal text-program/70">{o.hint}</span>
              {pick?.k === o.kind && <CoachBadge />}
            </button>
          ))}
      </div>
      <button className={`${ghost} w-full`} onClick={() => play({ t: "end" })}>
        {t("End turn (pass the device)")}
      </button>
    </Panel>
  );
}

/**
 * Facing one deal: read it, then TAKE / WALK / NEGOTIATE. A "sign now" deal counts down while you decide.
 * With "Render?" on, a teammate who reads the district better can read it for you, once per Face token.
 */
function FaceDeal({ s, play, run, d, card, deal }: { s: Session; play: Play; run: Local; d: District; card: Card; deal: ReturnType<typeof adviseDeal> | null }) {
  const g = s.g;
  const p = s.player;
  useLang();
  const cost = g.negCost(d);
  const [byName, setBy] = useState<string | null>(null);
  const by = byName ? g.players.find((x) => x.name === byName) ?? null : null;
  const offers = g.render && p.face > 0 ? g.active().filter((x) => g.canRender(p, x, d)) : [];
  // what this decision is made with: your own Read, or the teammate's who reads it for you
  const see = by ? by.sight[d] : p.sight[d];
  const shown = g.looks(p, d, card, see);
  const advice = by && s.coach ? safe(() => adviseDeal(g, { ...p, sight: { ...p.sight, [d]: see } } as Player, d, shown)) : deal;
  const [clock, left] = useSignNow(!!card.rush, see, s.config.clocks !== false);
  const close = g.partial && shown.trap && see === shown.lever - 1;
  const decide = (c: Choice) => {
    const tag = clockTag(clock);
    play({ t: "act", a: { ...toWire(g, { k: "face", d, choice: c, card, by }), ...(tag ? { clock: tag } : {}) } as WireAction });
  };
  const choice = (c: Choice, label: string) => (
    <button
      className={primary + picked(advice?.pick === c) + (c === "TAKE" && clock === "running" ? " urge ring-2 ring-[#E63946]" : "")}
      disabled={c === "NEGOTIATE" && p.trust < cost}
      onClick={() => decide(c)}
    >
      <span>{c === "TAKE" && clock === "running" ? t("SIGN NOW") : t(c)}</span>
      <span className="block text-[11px] font-normal">{label}</span>
      {advice?.pick === c && <CoachBadge />}
      {advice?.alt?.pick === c && <ShortcutBadge falls={advice.alt.falls} />}
    </button>
  );
  return (
    <Panel key="face" title={t("{name} faces a deal in {d}", { name: p.name, d: titleCase(d) })} sub={t("Read what you can, then decide.")}>
      <CoachBox s={s} run={run} view="deal" sight={see} advice={advice} />
      {offers.length > 0 && !by && (
        <div className="rounded-lg border border-[#c9a2ff]/50 bg-[#7b3fd1]/15 p-3 text-sm">
          <p className="font-serif text-lg italic text-[#e3d2ff]">{t("Render?")}</p>
          <p className="text-program/85">
            {t("A teammate who reads {d} better can read this one for you. It costs your Face ({n} left); the Cookout gives it back. Or read it yourself.", { d: titleCase(d), n: p.face })}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {offers.map((x) => (
              <button key={x.name} className="rounded-lg border border-[#c9a2ff]/60 px-3 py-1.5 font-bold text-[#e3d2ff]" onClick={() => setBy(x.name)}>
                {t("Let {name} read it (Read {n})", { name: x.name, n: x.sight[d] })}
              </button>
            ))}
          </div>
        </div>
      )}
      {by && (
        <p className="rounded-lg bg-[#7b3fd1]/15 px-3 py-2 text-sm text-[#e3d2ff]">
          {t("{name} is reading it for you, with Read {n}.", { name: by.name, n: see })} <button className="ml-2 text-xs underline" onClick={() => setBy(null)}>{t("Read it myself")}</button>
        </p>
      )}
      <SignNowClock state={clock} left={left} />
      <DealCard key={see} card={shown} district={d} sub={t(g.ed.districts[d].sub)} sight={see} effectiveLever={g.lever(d, shown)} formId={formId(s, d, card)} math={s.config.math} />
      <div className="grid gap-2 sm:grid-cols-3">
        {choice("TAKE", t("accept it"))}
        {choice("WALK", t("refuse it"))}
        {choice("NEGOTIATE", close ? t("{n} Trust · a close read: 5–6 on a die beats it", { n: cost }) : t("{n} Trust · beats a trap if Read ≥ lever", { n: cost }))}
      </div>
    </Panel>
  );
}

/** The Machine moving through a Fallen player, or a person playing the Overlord. */
export function MachinePanel({ s, play, local, who }: { s: Session; play: Play; local: Local; who: "fallen" | "overlord" }) {
  useLang();
  const [mode, setMode] = useState<null | "m_extract" | "m_obscure" | "m_tempt" | "m_counterfeit">(null);
  const g = s.g;
  const name = who === "fallen" ? s.player.name : g.ov()?.name ?? t("The Owner");
  const go = (a: Action) => play({ t: who, a: toWire(g, a) });
  return (
    <Panel
      title={who === "fallen" ? t("The Machine moves through {name}", { name }) : t("{name}: the Overlord moves", { name })}
      sub={(s.movesLeft === 1 ? t("1 move left.") : t("{n} moves left.", { n: s.movesLeft })) + " " + t("One move per district per round: the Machine spreads, it doesn't snipe.")}
    >
      {who === "fallen" && <CoachBox s={s} run={local} />}
      {mode === null && (
        <div key="menu" className="grid gap-2 sm:grid-cols-2">
          <button className={ghost} onClick={() => setMode("m_extract")}>{t("Strike")} <span className="block text-xs font-normal">{t("+1 Squeeze")}</span></button>
          <button className={ghost} onClick={() => setMode("m_obscure")}>{t("Muddy")} <span className="block text-xs font-normal">{t("−1 Clarity")}</span></button>
          <button className={ghost} onClick={() => setMode("m_tempt")}>{t("Tempt")} <span className="block text-xs font-normal">{t("−1 Trust")}</span></button>
          {who === "overlord" && (
            <button className={ghost} disabled={!g.canCounterfeit()} onClick={() => setMode("m_counterfeit")}>
              {t("Counterfeit")}{" "}
              <span className="block text-xs font-normal">
                {g.forged ? t("one a round: done") : t("a fake honest deal in a pile · {n} left", { n: g.forgeries })}
              </span>
            </button>
          )}
          <button className={ghost} onClick={() => go(who === "overlord" ? g.overlordAiMove(g.struck) : g.machineAiMove(g.struck))}>{t("Let the Machine choose")}</button>
        </div>
      )}
      {who === "overlord" && g.counterfeits.size > 0 && (
        <p className="text-xs text-[#c9a2ff]">{t("Your counterfeits wait in: {list}. Only Read 3 sees them. Keep it off the table's screens.", { list: [...g.counterfeits].map(titleCase).join(", ") })}</p>
      )}
      {mode === "m_counterfeit" && (
        <DistrictButtons
          ds={g.ds}
          disabled={(d) => g.counterfeits.has(d)}
          note={(d) => (g.counterfeits.has(d) ? t("one waiting here") : t("{n} can read blue here", { n: g.active().filter((x) => x.sight[d] >= 3).length }))}
          onPick={(d) => (setMode(null), go({ k: "m_counterfeit", d }))}
        />
      )}
      {(mode === "m_extract" || mode === "m_obscure") && (
        <DistrictButtons ds={g.ds} disabled={(d) => g.struck.has(d)} note={(d) => (g.struck.has(d) ? t("already moved here") : t("Squeeze {a} · Clarity {b}", { a: g.pressure[d], b: g.clarity[d] }))} onPick={(d) => (setMode(null), go({ k: mode, d }))} />
      )}
      {mode === "m_tempt" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {g.active().map((q) => (
            <button key={q.name} className={ghost} disabled={q.trust < 1} onClick={() => (setMode(null), go({ k: "m_tempt", t: q }))}>
              {t("{name} (Trust {n})", { name: q.name, n: q.trust })}
            </button>
          ))}
        </div>
      )}
      {mode && (
        <button className={ghost} onClick={() => setMode(null)}>
          {t("Back")}
        </button>
      )}
    </Panel>
  );
}

export function CookoutPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const g = s.g;
  useLang();
  const [picks, setPicks] = useState<Record<string, District>>(() => Object.fromEntries(g.active().map((p) => [p.name, g.cookoutGain(p)[0]])));
  const tip = s.coach ? safe(() => adviseCookout(g)) : null;
  return (
    <Panel title={t("Round {n}: call the Cookout?", { n: g.round })} sub={t("Once per game. Nobody takes actions this round. Everyone gets +2 Trust, −1 Shady, +1 Props, and catches up to the best reader at the table in one district. The Machine still moves.")}>
      <CoachBox s={s} run={local} advice={tip} />
      <div className="space-y-2">
        {g.active().map((p) => (
          <label key={p.name} className="flex items-center justify-between gap-2 text-sm">
            <span>{t("{name} catches up in", { name: p.name })}</span>
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
          <span>🍖 {t("Call the Cookout")}</span>
          {tip?.pick === true && <CoachBadge />}
        </button>
        <button className={ghost + picked(tip?.pick === false)} onClick={() => play({ t: "cookout", call: false })}>
          <span>{t("Not this round")}</span>
          {tip?.pick === false && <CoachBadge />}
        </button>
      </div>
    </Panel>
  );
}

export function SousouPanel({ s, play, local }: { s: Session; play: Play; local: Local }) {
  const g = s.g;
  useLang();
  const payers = g.active().filter((p) => p.trust >= 1).length;
  const pays = s.sousouWouldPay();
  const [d, setD] = useState<District>(() => g.ds.reduce((a, x) => (g.pressure[x] > g.pressure[a] ? x : a), g.ds[0]));
  const tip = s.coach ? safe(() => adviseSousou(s)) : null;
  return (
    <Panel title={t("The Sou-Sou")} sub={t("Everyone with Trust puts 1 in the can ({n} would). At {hand}, the next player's hand clears 2 Squeeze: no Shady.", { n: payers, hand: K.SOUSOU_HAND })}>
      <CoachBox s={s} run={local} advice={tip} />
      <p className="text-sm">
        {t("Pot {a}/{b} · next hand:", { a: g.pot, b: K.SOUSOU_HAND })} <b>{g.nextHand()?.name}</b>
        {pays ? " · " + t("this throw pays out!") : ""}
      </p>
      {pays && (
        <label className="flex items-center justify-between gap-2 text-sm">
          <span>{t("{name} pays off the debt in", { name: g.nextHand()?.name ?? "" })}</span>
          <select className="rounded bg-white/10 px-2 py-1" value={d} onChange={(e) => setD(e.target.value as District)}>
            {g.ds.map((x) => (
              <option key={x} value={x} className="text-ink">
                {titleCase(x)} ({t("Squeeze {n}", { n: g.pressure[x] })})
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={primary + picked(tip?.pick === true)} onClick={() => play({ t: "sousou", hand: true, d })}>
          <span>{t("Throw a hand")}</span>
          {tip?.pick === true && <CoachBadge />}
        </button>
        <button className={ghost + picked(tip?.pick === false)} onClick={() => play({ t: "sousou", hand: false })}>
          <span>{t("Not this round")}</span>
          {tip?.pick === false && <CoachBadge />}
        </button>
      </div>
    </Panel>
  );
}

export function MachineReport({ s, play, local }: { s: Session; play: Play; local: Local }) {
  useLang();
  const lines = s.g.log.slice(s.stepStart);
  return (
    <Panel title={t("The Machine moves")} sub={t("Here's what happened while the block was gathering itself.")}>
      <CoachBox s={s} run={local} />
      <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">
        {lines.map((l, i) => (
          <li key={i} className={l.startsWith("  ") ? "pl-3 text-program/90" : "font-semibold"}>
            {tLog(l.trim())}
          </li>
        ))}
      </ul>
      <button className={primary} onClick={() => play({ t: "next" })}>
        {t("Start round {n}", { n: s.g.round + 1 })}
      </button>
    </Panel>
  );
}

/** Book One, Chapter 2: at the start of round 2, does anyone take the Desk? */
export function DeskPanel({ s, play }: { s: Session; play: Play; local: Local }) {
  useLang();
  const g = s.g;
  return (
    <Panel
      title={t("A county job: the Desk")}
      sub={t("One player may take the Desk. At the Desk: +1 Trust every round, but no facing deals and no teaching, and every second round its paperwork feeds the Machine an extra strike. Quitting it, for good, takes an action.")}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {g.active().map((p) => (
          <button key={p.name} className={`${ghost} text-left`} onClick={() => play({ t: "desk", who: p.name })}>
            🪑 {t("{name} takes the Desk", { name: p.name })}
          </button>
        ))}
      </div>
      <button className={primary} onClick={() => play({ t: "desk", who: null })}>
        {t("Nobody takes it")}
      </button>
    </Panel>
  );
}

/** Book One, Chapter 3, with a person playing the Overlord: offer the Crown? */
export function CrownOfferPanel({ s, play }: { s: Session; play: Play; local: Local }) {
  useLang();
  const g = s.g;
  return (
    <Panel title={t("Offer the Crown?")} sub={t("Once a game. If they wear it, they can't Fall and everyone else loses 1 Trust a round. If they refuse, you get one extra move this round.")}>
      <div className="grid gap-2 sm:grid-cols-2">
        {g.active().map((p) => (
          <button key={p.name} className={`${ghost} text-left`} onClick={() => play({ t: "crownOffer", to: p.name })}>
            👑 {t("Offer it to {name}", { name: p.name })} <span className="block text-xs font-normal text-program/70">{t("Shady {a} · Trust {b}", { a: p.corruption, b: p.trust })}</span>
          </button>
        ))}
      </div>
      <button className={primary} onClick={() => play({ t: "crownOffer", to: null })}>
        {t("Not this round")}
      </button>
    </Panel>
  );
}

/** Book One, Chapter 3: the offered player wears the Crown or refuses it */
export function CrownPanel({ s, play }: { s: Session; play: Play; local: Local }) {
  useLang();
  const to = s.crownTo!;
  const p = s.g.byName(to);
  return (
    <Panel
      title={t("{name}: the Owner offers you the Crown", { name: to })}
      sub={t("A way up, out of the life. Wear it, and you can't Fall, but every other player loses 1 Trust at the start of every round. Refuse, and the Owner takes one extra move this round.")}
    >
      {p && <p className="text-sm">{t("You carry {a} Shady (at {flip} you Fall) and {b} Trust.", { a: p.corruption, flip: K.FLIP, b: p.trust })}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        <button className={ghost} onClick={() => play({ t: "crown", to, wear: true })}>
          👑 {t("Wear it")}
        </button>
        <button className={primary} onClick={() => play({ t: "crown", to, wear: false })}>
          {t("Refuse it")}
        </button>
      </div>
    </Panel>
  );
}
