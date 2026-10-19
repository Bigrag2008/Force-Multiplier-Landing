"use client";
import { useEffect, useState } from "react";
import { loadGame } from "@/game/save";
import { newRoomCode } from "@/net/protocol";
import { ContinueCard } from "@/ui/ContinueCard";
import { GameScreen } from "@/ui/GameScreen";
import { HostGame } from "@/ui/Online";
import { Setup } from "@/ui/Setup";
import type { GameStart } from "@/ui/useSession";

export default function PlayPage() {
  const [start, setStart] = useState<GameStart | null>(null);
  /** online: this device hosts the room with this code */
  const [room, setRoom] = useState<string | null>(null);
  const [game, setGame] = useState(0);
  const begin = (s: GameStart, code: string | null) => (setStart(s), setRoom(code), setGame((n) => n + 1));
  // from the home page's "Continue your game"
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("continue")) return;
    const save = loadGame();
    if (save) begin({ save }, save.room ?? null); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  if (!start)
    return (
      <main className="px-4 py-8">
        <ContinueCard onContinue={(save) => begin({ save }, save.room ?? null)} />
        <h1 className="mb-6 text-center text-4xl font-black text-gold">Set the table</h1>
        <Setup onStart={(config, online) => begin({ config }, online ? newRoomCode() : null)} />
      </main>
    );
  if (room) return <HostGame key={game} start={start} code={room} onQuit={() => setStart(null)} />;
  return <GameScreen key={game} start={start} onQuit={() => setStart(null)} />;
}
