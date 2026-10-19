"use client";
import { useEffect, useState } from "react";
import { loadGame } from "@/game/save";
import { ContinueCard } from "@/ui/ContinueCard";
import { GameScreen } from "@/ui/GameScreen";
import { Setup } from "@/ui/Setup";
import type { GameStart } from "@/ui/useSession";

export default function PlayPage() {
  const [start, setStart] = useState<GameStart | null>(null);
  const [game, setGame] = useState(0);
  const begin = (s: GameStart) => (setStart(s), setGame((n) => n + 1));
  // from the home page's "Continue your game"
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("continue")) return;
    const save = loadGame();
    if (save) begin({ save }); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  if (!start)
    return (
      <main className="px-4 py-8">
        <ContinueCard onContinue={(save) => begin({ save })} />
        <h1 className="mb-6 text-center text-4xl font-black text-gold">Set the table</h1>
        <Setup onStart={(config) => begin({ config })} />
      </main>
    );
  return <GameScreen key={game} start={start} onQuit={() => setStart(null)} />;
}
