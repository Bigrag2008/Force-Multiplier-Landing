"use client";
import { useCallback, useState } from "react";
import { C, K } from "../engine/content";
import type { SessionConfig } from "../game/session";
import { CookoutPanel, MachinePanel, MachineReport, SousouPanel, TurnPanel } from "./ActionPanel";
import { Board } from "./Board";
import { EndScreen } from "./EndScreen";
import { EventFeed } from "./EventFeed";
import { IntroComic } from "./IntroComic";
import { Players } from "./Players";
import { useSession } from "./useSession";

const INTRO_SEEN = "sn-intro-seen";
/** has this device already seen the story? (storage can be unavailable: then show it) */
function introSeen() {
  try {
    return window.localStorage.getItem(INTRO_SEEN) === "1";
  } catch {
    return false;
  }
}

/** `story`: "always" for the guided game; "first-time" shows the intro comic once per device */
export function GameScreen({ config, onQuit, story = "first-time" }: { config: SessionConfig; onQuit: () => void; story?: "always" | "first-time" }) {
  const { session: s, run, version, changes } = useSession(config);
  const [showHistory, setShowHistory] = useState(false);
  const [showIntro, setShowIntro] = useState(() => story === "always" || !introSeen());
  const closeIntro = useCallback(() => {
    setShowIntro(false);
    try {
      window.localStorage.setItem(INTRO_SEEN, "1");
    } catch {
      // private mode: the story just shows again next time
    }
  }, []);
  const g = s.g;
  const panelKey = `${s.phase}-${s.seat}-${g.round}-${s.actionsLeft}-${s.movesLeft}`;
  const intro = g.chapter ?? null;

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-4">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/30 pb-3">
        <div>
          <h1 className="text-2xl font-black text-gold">The Second Number</h1>
          <p className="text-xs text-program/70">
            {C.edition} · {g.overlord ? "Overlord mode" : g.scenario} · round {g.round}/{K.MAX_ROUNDS}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2" title="The Coach recommends a move, explains why, and teaches each rule the first time it comes up.">
            <input type="checkbox" checked={s.coach} onChange={(e) => run((x) => (x.coach = e.target.checked))} />
            🧑🏾‍🏫 Coach
          </label>
          <label className="flex items-center gap-2" title="When a Machine strike would capture a district, open the Green Book automatically (once per game).">
            <input type="checkbox" checked={s.autoGreenBook} onChange={(e) => run((x) => (x.autoGreenBook = e.target.checked))} />
            📗 Open the Green Book when a capture is coming
          </label>
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
          <b className="text-gold">The Long Ledger · Chapter {intro.number}: {intro.title} ({intro.era}).</b> {intro.intro}
          <p className="mt-1"><b>The twist:</b> {intro.twist}</p>
          {intro.league && <p className="mt-1"><b>{intro.league.name}:</b> {intro.league.text}</p>}
        </aside>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <Board s={s} changes={changes} />
          <Players s={s} changes={changes} />
        </div>
        {/* on phones the actions come first; on wide screens they sit beside the board */}
        <div className="order-first space-y-4 lg:order-none">
          <div key={panelKey}>
            {s.phase === "turn" && <TurnPanel s={s} run={run} onHistory={() => setShowHistory(true)} />}
            {s.phase === "fallen" && <MachinePanel s={s} run={run} who="fallen" />}
            {s.phase === "overlord" && <MachinePanel s={s} run={run} who="overlord" />}
            {s.phase === "cookout" && <CookoutPanel s={s} run={run} />}
            {s.phase === "sousou" && <SousouPanel s={s} run={run} />}
            {s.phase === "machine" && <MachineReport s={s} run={run} />}
            {s.phase === "over" && <EndScreen s={s} onAgain={onQuit} />}
          </div>
          <EventFeed s={s} version={version} />
        </div>
      </div>

      {showIntro && <IntroComic onDone={closeIntro} />}

      {showHistory && g.historyCard && (
        <div role="dialog" aria-modal="true" aria-labelledby="history-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowHistory(false)}>
          <div className="max-w-lg rounded-2xl border-2 border-gold bg-program p-6 text-ink shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-widest text-[#5a3d1e]">History · read it aloud</p>
            <h2 id="history-title" className="mt-1 text-2xl font-black">{g.historyCard.title}</h2>
            <p className="text-sm text-black/60">{g.historyCard.year} · {g.historyCard.place}</p>
            <p className="mt-3">{g.historyCard.story}</p>
            <p className="mt-3 font-bold italic">“{g.historyCard.lesson}”</p>
            <button className="mt-4 rounded-lg bg-night px-4 py-2 font-bold text-gold" onClick={() => setShowHistory(false)} autoFocus>
              Back to the block
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
