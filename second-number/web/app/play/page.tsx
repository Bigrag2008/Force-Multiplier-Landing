"use client";
import { useState } from "react";
import type { SessionConfig } from "@/game/session";
import { GameScreen } from "@/ui/GameScreen";
import { Setup } from "@/ui/Setup";

export default function PlayPage() {
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [game, setGame] = useState(0);
  if (!config)
    return (
      <main className="px-4 py-8">
        <h1 className="mb-6 text-center text-4xl font-black text-gold">Set the table</h1>
        <Setup onStart={(c) => (setConfig(c), setGame((n) => n + 1))} />
      </main>
    );
  return <GameScreen key={game} config={config} onQuit={() => setConfig(null)} />;
}
