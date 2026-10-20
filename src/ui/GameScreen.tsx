"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ImpactLayer, spokenImpact, useImpactSound, useJolt } from "./Impact";
import { setSoundOn, soundOn } from "./sound";
import { readImpact } from "./readImpact";
import { C } from "../engine/content";
import type { Move } from "../game/moves";
import type { Session } from "../game/session";
import { waitingOn } from "../net/protocol";
import { CookoutPanel, CrownOfferPanel, CrownPanel, DeskPanel, MachinePanel, MachineReport, SousouPanel, TurnPanel } from "./ActionPanel";
import { Board } from "./Board";
import { EndScreen } from "./EndScreen";
import { EventFeed } from "./EventFeed";
import { IntroComic } from "./IntroComic";
import { Players } from "./Players";
import { useSession, type GameStart } from "./useSession";

const INTRO_SEEN = "sn-intro-seen";
/** has this device already seen the story? (storage can be unavailable: then show it) */
function introSeen() {
  try {
    return window.localStorage.getItem(INTRO_SEEN) === "1";
  } catch {
    return false;
  }
}

/** Online play, from this device's side (see src/net/protocol.ts). */
export interface Net {
  /** the seats this device plays ("all" on a device passed around the table) */
  mine: ReadonlySet<string> | "all";
  /** a phone: send moves to the host instead of making them */
  send?: (m: Move) => void;
  /** the host: pass each move on to the phones */
  onApplied?: (m: Move) => void;
  /** hands the session and `apply` to whoever runs the connection */
  onReady?: (s: Session, apply: (m: Move) => boolean) => void;
  /** a phone keeps no save: the game lives on the host */
  autosave?: boolean;
  /** the room's code and who's at the table, shown above the board */
  room?: ReactNode;
}

/**
 * A game on this device: a new one or a saved one (`start`).
 * `story`: "always" for the guided game; "first-time" shows the intro comic once per device.
 */
export function GameScreen({ start, onQuit, story = "first-time", net }: { start: GameStart; onQuit: () => void; story?: "always" | "first-time"; net?: Net }) {
  const { session: s, play, local, apply, version, changes } = useSession(start, { send: net?.send, onApplied: net?.onApplied, autosave: net?.autosave });
  const onReady = net?.onReady;
  useEffect(() => onReady?.(s, apply), [onReady, s, apply]);
  const mine = net?.mine ?? "all";
  const waiting = waitingOn(s);
  const myMove = waiting === null || mine === "all" || mine.has(waiting);
  // a History card shows when it's told; one already told before a reload stays put away
  const [historyRead, setHistoryRead] = useState(() => s.g.historyCard);
  const [showIntro, setShowIntro] = useState(() => "config" in start && (story === "always" || !introSeen()));
  const closeIntro = useCallback(() => {
    setShowIntro(false);
    try {
      window.localStorage.setItem(INTRO_SEEN, "1");
    } catch {
      // private mode: the story just shows again next time
    }
  }, []);
  const g = s.g;
  const showHistory = g.historyCard !== null && g.historyCard !== historyRead;
  const closeHistory = () => setHistoryRead(g.historyCard);
  const panelKey = `${s.phase}-${s.seat}-${g.round}-${s.actionsLeft}-${s.movesLeft}`;
  const intro = g.chapter ?? null;
  // what the last move meant: a verdict on the decision, banners for the big moments, strikes one by one
  const impact = useMemo(() => (changes ? readImpact(g, changes.lines, changes.delta) : null), [changes, g]);
  const root = useRef<HTMLDivElement>(null);
  useJolt(root, impact, changes?.id ?? 0);
  useImpactSound(impact, changes?.id ?? 0);
  const [sound, setSound] = useState(true);
  useEffect(() => setSound(soundOn()), []); // eslint-disable-line react-hooks/set-state-in-effect

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <a href="#your-move" className="skip-link">Skip to your move</a>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 pb-3">
        <div>
          <h1 className="text-2xl font-black text-gold">The Second Number</h1>
          <p className="text-xs text-program/70">
            {g.ed.name} · {g.overlord ? "Overlord mode" : g.scenario} · round {g.round}/{g.maxRounds}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2" title="The Coach recommends a move, explains why, and teaches each rule the first time it comes up.">
            <input type="checkbox" checked={s.coach} onChange={(e) => local((x) => (x.coach = e.target.checked))} />
            🧑🏾‍🏫 Coach
          </label>
          {!g.party && (
            <label className="flex items-center gap-2" title="When a Machine strike would capture a district, open the Green Book automatically (once per game).">
              <input type="checkbox" checked={s.autoGreenBook} onChange={(e) => play({ t: "greenbook", on: e.target.checked })} />
              📗 Open the Green Book when a capture is coming
            </label>
          )}
          <button
            className="rounded-md border border-white/25 px-2 py-1 hover:bg-white/10"
            aria-pressed={sound}
            onClick={() => (setSoundOn(!sound), setSound(!sound))}
            title={sound ? "Turn the sound off" : "Turn the sound on"}
          >
            {sound ? "🔊 Sound" : "🔇 Muted"}
          </button>
          <button className="rounded-md border border-white/25 px-2 py-1 hover:bg-white/10" onClick={() => setShowIntro(true)}>
            Story
          </button>
          <a href="/how-to-play" target="_blank" className="rounded-md border border-white/25 px-2 py-1 hover:bg-white/10">
            Rules
          </a>
          <button className="rounded-md border border-white/25 px-2 py-1 hover:bg-white/10" onClick={onQuit}>
            New game
          </button>
        </div>
      </header>

      {intro && g.round === 1 && s.phase !== "over" && (
        <aside className="rounded-xl border border-gold/40 bg-black/25 p-3 text-sm">
          <b className="text-gold">{C.campaigns[intro.campaign].title} · Chapter {intro.number}: {intro.title} ({intro.era}).</b> {intro.intro}
          <p className="mt-1"><b>The twist:</b> {intro.twist}</p>
          {intro.league && <p className="mt-1"><b>{intro.league.name}:</b> {intro.league.text}</p>}
        </aside>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div ref={root} className="space-y-4">
          <Board s={s} changes={changes} impact={impact} />
          <Players s={s} changes={changes} />
        </div>
        {/* on phones the actions come first; on wide screens they sit beside the board */}
        <div className="order-first space-y-4 lg:order-none">
          {net?.room}
          <div key={panelKey} id="your-move" tabIndex={-1} aria-label="Your move">
            {!myMove && <WaitingPanel s={s} who={waiting!} />}
            {myMove && s.phase === "turn" && <TurnPanel s={s} play={play} local={local} />}
            {myMove && s.phase === "fallen" && <MachinePanel s={s} play={play} local={local} who="fallen" />}
            {myMove && s.phase === "overlord" && <MachinePanel s={s} play={play} local={local} who="overlord" />}
            {s.phase === "cookout" && <CookoutPanel s={s} play={play} local={local} />}
            {s.phase === "desk" && <DeskPanel s={s} play={play} local={local} />}
            {myMove && s.phase === "crownOffer" && <CrownOfferPanel s={s} play={play} local={local} />}
            {myMove && s.phase === "crown" && <CrownPanel s={s} play={play} local={local} />}
            {s.phase === "sousou" && <SousouPanel s={s} play={play} local={local} />}
            {s.phase === "machine" && <MachineReport s={s} play={play} local={local} />}
            {s.phase === "over" && <EndScreen s={s} onAgain={onQuit} />}
          </div>
          <EventFeed s={s} version={version} />
        </div>
      </div>

      <ImpactLayer impact={impact} id={changes?.id ?? 0} />
      {/* screen readers hear what each move did, once, in plain words */}
      <p className="sr-only" aria-live="polite" role="status">{spokenImpact(impact)}</p>

      {showIntro && <IntroComic onDone={closeIntro} where={g.ed.id === "west-dayton" ? undefined : `${cap(g.ed.area)} of ${g.ed.city.split(",")[0]}`} />}

      {showHistory && g.historyCard && (
        <div role="dialog" aria-modal="true" aria-labelledby="history-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={closeHistory} onKeyDown={(e) => e.key === "Escape" && closeHistory()}>
          <div className="max-w-lg rounded-2xl border-2 border-gold bg-program p-6 text-ink shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-widest text-[#5a3d1e]">History · read it aloud</p>
            <h2 id="history-title" className="mt-1 text-2xl font-black">{g.historyCard.title}</h2>
            <p className="text-sm text-black/60">{g.historyCard.year} · {g.historyCard.place}</p>
            <p className="mt-3">{g.historyCard.story}</p>
            <p className="mt-3 font-bold italic">“{g.historyCard.lesson}”</p>
            <button className="mt-4 rounded-lg bg-night px-4 py-2 font-bold text-gold" onClick={closeHistory} autoFocus>
              Back to the block
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/** "the West Side" → "The West Side" */
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/** someone else's turn, on their own phone */
function WaitingPanel({ s, who }: { s: Session; who: string }) {
  const pd = s.pending;
  const doing =
    s.phase === "fallen"
      ? "The Machine is moving through them."
      : s.phase === "overlord" || s.phase === "crownOffer"
        ? "The Overlord is choosing where to strike."
        : s.phase === "crown"
          ? "The Owner has made them an offer. It's their call."
        : pd?.k === "deal"
          ? `Reading a deal in ${pd.d.charAt(0) + pd.d.slice(1).toLowerCase()}…`
          : pd?.k === "teach"
            ? `Teaching ${pd.to}: listen for the second number.`
            : `${s.actionsLeft} action${s.actionsLeft === 1 ? "" : "s"} left.`;
  return (
    <section className="rounded-xl border border-white/20 bg-night/80 p-4" aria-live="polite">
      <p className="text-xs font-black uppercase tracking-widest text-program/60">Waiting on</p>
      <h2 className="text-lg font-black text-gold">{who}</h2>
      <p className="mt-1 text-sm text-program/85">{doing}</p>
      <p className="mt-2 text-xs text-program/60">It&apos;s their move, on their phone. The board updates as they play.</p>
    </section>
  );
}
