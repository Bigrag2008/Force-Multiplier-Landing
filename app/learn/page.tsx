"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { C } from "@/engine/content";
import type { SessionConfig } from "@/game/session";
import { GameScreen } from "@/ui/GameScreen";

/** A first game with the Coach: the Translator, the Student and the Elder, a head-start scenario, every rule explained as it comes up. */
const LEARN: SessionConfig = { mode: "coop", roster: C.roster.slice(0, 3), scenario: "The Audit", coach: true };

export default function LearnPage() {
  const router = useRouter();
  // the game is dealt in the browser, so the page never shows a server-dealt board; ?seed= replays a game
  const [config, setConfig] = useState<SessionConfig | null>(null);
  useEffect(() => {
    const seed = Number(new URLSearchParams(window.location.search).get("seed")) || undefined;
    setConfig({ ...LEARN, seed }); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  if (!config) return <p className="p-8 text-center text-program/70">Setting the table…</p>;
  return <GameScreen config={config} onQuit={() => router.push("/play")} />;
}
